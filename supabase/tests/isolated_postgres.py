"""Run migrations and SQL tests on a disposable native PostgreSQL instance.

Set PG_BIN to the PostgreSQL bin directory or place its programs on PATH.
Only the Auth user key, roles and auth.uid() contract are supplied locally.
"""
import os
import secrets
import socket
import subprocess
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BIN = Path(os.environ.get("PG_BIN", ""))
BOOTSTRAP = """
create role anon;
create role authenticated;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth to authenticated;
-- Exercise the explicit migration revokes under permissive API defaults.
alter default privileges in schema public grant all on tables to authenticated, anon;
"""


def executable(name):
    return str(BIN / name) if BIN != Path(".") else name


def run(name, args, env, **kwargs):
    return subprocess.run([executable(name), *args], env=env, check=True, **kwargs)


def race(env, first_sql, second_sql, failure_state=None):
    """Hold the first write open until the second session is waiting for a lock."""
    cli = [executable("psql"), "-XqAt", "-v", "ON_ERROR_STOP=1", "-v", "VERBOSITY=verbose"]
    with subprocess.Popen(cli, env=env, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                          stderr=subprocess.STDOUT, text=True) as first:
        try:
            first.stdin.write("begin;\n" + first_sql + "\n\\echo HELD\n")
            first.stdin.flush()
            for line in first.stdout:
                if line.strip() == "HELD":
                    break
            else:
                raise RuntimeError("first operation failed before lock barrier")
            with subprocess.Popen(cli + ["-c", second_sql],
                                  env={**env, "PGAPPNAME": "pucara_contender"},
                                  stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True) as second:
                try:
                    for _ in range(100):
                        probe = run("psql", ["-XqAtc", """select count(*) from pg_stat_activity
                            where application_name='pucara_contender' and wait_event_type='Lock'"""],
                            env, capture_output=True, text=True)
                        if probe.stdout.strip() == "1":
                            break
                        if second.poll() is not None:
                            raise RuntimeError("contender finished before lock barrier")
                        time.sleep(0.05)
                    else:
                        raise RuntimeError("did not observe simultaneous lock contention")
                    first.stdin.write("commit;\n\\q\n")
                    first.stdin.flush()
                    if first.wait(timeout=10) != 0:
                        raise RuntimeError("first transaction failed to commit")
                    _, error = second.communicate(timeout=10)
                    if failure_state is None:
                        if second.returncode:
                            raise RuntimeError(error)
                    elif second.returncode == 0 or failure_state not in error:
                        raise RuntimeError("unexpected contender result: " + error)
                finally:
                    if second.poll() is None:
                        second.kill()
        finally:
            if first.poll() is None:
                first.kill()


def contention(env):
    def uid(n):
        return f"'00000000-0000-4000-8000-{n:012}'"

    def session(actor, sql):
        return f"set role authenticated; select set_config('request.jwt.claim.sub',{uid(actor)},false); {sql}"

    def book(actor, member, key, court, start):
        return session(actor, f"""select public.padel_command({uid(11)},{uid(member)},{uid(key)},'book',
                       null,null,{uid(court)},'2099-06-01 {start}-03');""")

    def scalar(sql):
        return run("psql", ["-XqAtc", sql], env, capture_output=True, text=True).stdout.strip()

    def check(sql, expected):
        result = scalar(sql)
        if result != expected:
            raise RuntimeError(f"expected {expected}, got {result}: {sql}")

    race(env, book(1, 21, 81, 31, "09:00"), book(2, 24, 82, 31, "09:00"), "23P01")
    check("select count(*) from public.padel_occupancy where kind='reservation'", "1")
    check(f"select turns from public.padel_credits where member_id={uid(24)}", "1")
    print("PASS: simultaneous bookings of one court leave losing member's credit intact", flush=True)

    race(env, book(2, 24, 83, 31, "10:30"), book(2, 24, 84, 32, "12:00"), "payment_required")
    check(f"select count(*) from public.padel_movements where member_id={uid(24)} and reason='booking'", "1")
    check(f"select count(*) from public.padel_occupancy where member_id={uid(24)}", "1")
    print("PASS: concurrent requests for different slots cannot spend the last credit twice", flush=True)

    booking = scalar(f"select id from public.padel_occupancy where member_id={uid(21)}")
    scalar(f"insert into pucara_private.cancellation_approvals values({uid(11)},'{booking}',1,'test')")
    cancel = session(1, f"select public.padel_command({uid(11)},{uid(21)},{uid(85)},'cancel','{booking}',1);")
    race(env, cancel, cancel)
    check(f"select count(*) from public.padel_movements where reservation_id='{booking}' and reason='cancellation'", "1")
    check(f"select turns from public.padel_credits where member_id={uid(21)}", "1")
    print("PASS: simultaneous retries of one cancellation return one credit", flush=True)


def main():
    # Never target an existing cluster. initdb prepares this unique directory.
    with tempfile.TemporaryDirectory(prefix="pucara-pg-test-") as tmp:
        root = Path(tmp)
        cluster = root / "data"
        password = secrets.token_urlsafe(32)
        pwfile = root / "initial-password"
        pwfile.write_text(password, encoding="ascii")
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            port = sock.getsockname()[1]
        base_env = {k: v for k, v in os.environ.items() if not k.startswith("PG")}
        env = {**base_env, "PGHOST": "127.0.0.1", "PGPORT": str(port),
               "PGUSER": "postgres", "PGDATABASE": "postgres", "PGPASSWORD": password,
               "PGCLIENTENCODING": "UTF8", "PGOPTIONS": "-c statement_timeout=20000"}
        run("initdb", ["-D", str(cluster), "-U", "postgres", "--auth=scram-sha-256",
                       "--pwfile", str(pwfile), "--encoding=UTF8", "--no-locale"], env)
        pwfile.unlink()
        with (cluster / "postgresql.conf").open("a", encoding="utf-8") as config:
            config.write("\nunix_socket_directories = ''\n")
        run("pg_ctl", ["-D", str(cluster), "-l", str(root / "server.log"), "-w",
                       "-o", f"-h 127.0.0.1 -p {port}", "start"], env)
        try:
            args = ["-X", "-v", "ON_ERROR_STOP=1"]
            run("psql", args, env, input=BOOTSTRAP, text=True)
            for sql in [*sorted((ROOT / "supabase/migrations").glob("*.sql")),
                        ROOT / "supabase/seed/demo.sql", ROOT / "supabase/tests/foundations.sql"]:
                run("psql", [*args, "-1", "-f", str(sql)] if sql.name != "foundations.sql"
                    else [*args, "-f", str(sql)], env)
            contention(env)
        finally:
            run("pg_ctl", ["-D", str(cluster), "-w", "-m", "fast", "stop"], env)


if __name__ == "__main__":
    main()
