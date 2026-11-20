-- Administrative provisioning is trusted. No client API can claim a member number.
create schema pucara_private;
revoke all on schema pucara_private from public, anon, authenticated;
-- Cluster roles can survive a local database reset.
do $$
begin
  if not exists (select from pg_roles where rolname='pucara_reader') then
    create role pucara_reader nologin noinherit;
  end if;
  if not exists (select from pg_roles where rolname='pucara_booking') then
    create role pucara_booking nologin noinherit;
  end if;
  if exists (select from pg_roles where rolname in ('pucara_reader','pucara_booking')
    and (rolsuper or rolcreaterole or rolcreatedb or rolcanlogin or rolbypassrls or rolinherit)) then
    raise exception 'unsafe existing Pucara function owner';
  end if;
end $$;
grant pucara_reader, pucara_booking to postgres;
grant usage on schema public, auth, pucara_private to pucara_reader, pucara_booking;
grant execute on function auth.uid() to pucara_reader, pucara_booking;

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/Argentina/Buenos_Aires'
);
create table public.members (
  club_id uuid references public.clubs not null,
  id uuid not null default gen_random_uuid(),
  member_number text not null,
  display_name text not null,
  is_minor boolean not null,
  primary key (club_id, id),
  unique (club_id, member_number),
  unique (club_id, id, is_minor)
);
create table pucara_private.memberships (
  club_id uuid references public.clubs,
  user_id uuid references auth.users,
  active boolean not null default true,
  primary key (club_id, user_id)
);
create table pucara_private.member_links (
  club_id uuid not null,
  user_id uuid not null,
  member_id uuid not null,
  primary key (club_id, user_id),
  unique (club_id, member_id),
  foreign key (club_id, user_id) references pucara_private.memberships,
  foreign key (club_id, member_id) references public.members
);
create table pucara_private.guardians (
  club_id uuid not null,
  user_id uuid not null,
  member_id uuid not null,
  minor_marker boolean generated always as (true) stored,
  verified_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (club_id, user_id, member_id),
  foreign key (club_id, user_id) references pucara_private.memberships,
  foreign key (club_id, member_id, minor_marker) references public.members (club_id, id, is_minor)
);
create table pucara_private.role_grants (
  club_id uuid not null,
  user_id uuid not null,
  role text not null check (role in ('member','administrator','fitness_coach','team_coach','activity_instructor')),
  scope text not null check (scope in ('directory','padel','gym','rugby','hockey','activities')),
  primary key (club_id,user_id,role,scope),
  foreign key (club_id,user_id) references pucara_private.memberships
);
create table pucara_private.scholarships (
  club_id uuid not null,
  member_id uuid not null,
  percent smallint not null check (percent between 0 and 100),
  primary key (club_id,member_id),
  foreign key (club_id,member_id) references public.members
);

revoke all on all tables in schema pucara_private from public, anon, authenticated;
grant select on pucara_private.memberships, pucara_private.member_links,
  pucara_private.guardians, pucara_private.role_grants to pucara_reader;

-- A single access decision per actor/club. A guardian can read but cannot book for a minor.
create function pucara_private.allowed(c uuid, m uuid, capability text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from pucara_private.memberships a
    where a.club_id = c and a.user_id = auth.uid() and a.active and (
      capability = 'club.read'
      or (capability in ('member.read','padel.self') and exists (
        select 1 from pucara_private.member_links l where (l.club_id,l.user_id,l.member_id) = (c,a.user_id,m)))
      or (capability = 'member.read' and exists (
        select 1 from pucara_private.guardians g where (g.club_id,g.user_id,g.member_id) = (c,a.user_id,m)
          and g.verified_at <= now() and g.revoked_at is null))
      or (capability = 'directory.read' and exists (
        select 1 from pucara_private.role_grants r where (r.club_id,r.user_id) = (c,a.user_id)
          and r.role = 'administrator' and r.scope = 'directory'))
    )
  )
$$;
grant create on schema pucara_private to pucara_reader;
alter function pucara_private.allowed(uuid,uuid,text) owner to pucara_reader;
revoke create on schema pucara_private from pucara_reader;
revoke all on function pucara_private.allowed(uuid,uuid,text) from public, anon, authenticated;
grant usage on schema pucara_private to authenticated;
grant execute on function pucara_private.allowed(uuid,uuid,text) to authenticated, pucara_booking;

alter table public.clubs enable row level security;
alter table public.members enable row level security;
revoke all on public.clubs,public.members from public, anon, authenticated;
grant select on public.clubs,public.members to authenticated;
create policy club_read on public.clubs for select to authenticated
  using (pucara_private.allowed(id,null,'club.read'));
create policy member_read on public.members for select to authenticated
  using (pucara_private.allowed(club_id,id,'member.read') or pucara_private.allowed(club_id,null,'directory.read'));
