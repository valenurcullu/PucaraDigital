-- psql -X -v ON_ERROR_STOP=1 -f supabase/tests/foundations.sql
-- Requires the local seed. All test changes roll back.
begin;
create function pg_temp.id(n int) returns uuid language sql immutable as $$
 select ('00000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid
$$;
create function pg_temp.check_that(ok boolean, label text) returns void language plpgsql as $$
begin
 if ok is distinct from true then raise exception 'FAILED: %',label; end if;
 raise notice 'PASS: %',label;
end $$;
create function pg_temp.rejects(stmt text, expected text, label text, reason text default null)
returns void language plpgsql as $$
begin
 begin
   execute stmt;
 exception when others then
   if sqlstate <> expected or (reason is not null and sqlerrm <> reason) then raise; end if;
   raise notice 'PASS: %',label;
   return;
 end;
 raise exception 'FAILED: expected rejection: %',label;
end $$;

set local role anon;
select pg_temp.rejects('select * from public.members','42501','anonymous cannot read directory');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub',pg_temp.id(1)::text,true);
select pg_temp.check_that((select count(*)=1 from public.clubs),'single visible club');
select pg_temp.check_that((select array_agg(id order by id)=array[pg_temp.id(21),pg_temp.id(22),pg_temp.id(23)] from public.members),'own record and both linked minors only');
select pg_temp.rejects('update public.members set display_name=''changed''','42501','member cannot edit administrative data');
select pg_temp.rejects('insert into pucara_private.role_grants default values','42501','no role self-assignment');
select pg_temp.rejects('insert into pucara_private.member_links default values','42501','no self-link by member number');
select pg_temp.rejects('update pucara_private.scholarships set percent=100','42501','scholarships protected');
select pg_temp.rejects('update public.padel_credits set turns=10','42501','no balance writes');
select pg_temp.rejects('insert into public.padel_occupancy default values','42501','no direct booking writes');
select pg_temp.check_that((select count(*)=9 from public.padel_availability(pg_temp.id(11),'2099-06-01','2099-06-02')),'administrative block excluded');
select pg_temp.check_that((select count(*)=0 from public.padel_availability(pg_temp.id(12),'2099-06-01','2099-06-02')),'other club availability hidden');
select pg_temp.rejects($q$select public.padel_command(pg_temp.id(11),pg_temp.id(22),pg_temp.id(50),'book')$q$,'42501','guardian cannot spend for minor');
select pg_temp.rejects($q$select public.padel_command(pg_temp.id(12),pg_temp.id(25),pg_temp.id(50),'book')$q$,'42501','other club booking denied');
select set_config('request.jwt.claim.sub',pg_temp.id(2)::text,true);
select pg_temp.check_that((select count(*)=2 from public.members),'second guardian sees shared child and self only');
reset role;
update pucara_private.guardians set revoked_at=now() where user_id=pg_temp.id(2);
set local role authenticated;
select pg_temp.check_that((select count(*)=1 from public.members),'revocation immediately hides minor');
select set_config('request.jwt.claim.sub',pg_temp.id(5)::text,true);
select pg_temp.check_that((select count(*)=4 from public.members),'directory administrator restricted to assigned club');
select pg_temp.check_that((select count(*)=0 from public.padel_credits),'directory scope grants no financial access');
select set_config('request.jwt.claim.sub',pg_temp.id(4)::text,true);
select pg_temp.check_that((select count(*)=0 from public.clubs),'inactive membership denied');

select set_config('request.jwt.claim.sub',pg_temp.id(1)::text,true);
create function pg_temp.book(m int,k int,court int,t timestamptz) returns uuid language sql as $$
 select public.padel_command(pg_temp.id(11),pg_temp.id(m),pg_temp.id(k),'book',null,null,pg_temp.id(court),t)
$$;
select pg_temp.rejects($q$select pg_temp.book(21,58,31,'2099-06-01 13:30-03')$q$,'23P01','administrative block prevents actual reservation');
select pg_temp.rejects($q$select pg_temp.book(21,59,31,'2099-06-03 09:00-03')$q$,'23503','cannot book an unpublished slot');
select pg_temp.check_that((select count(*)=1 from public.padel_credits),'only personal credit account visible');
select pg_temp.book(21,51,31,'2099-06-01 09:00-03') as reservation_id \gset
select pg_temp.check_that(pg_temp.book(21,51,31,'2099-06-01 09:00-03')=:'reservation_id','retry returns same booking');
select pg_temp.rejects($q$select pg_temp.book(21,51,32,'2099-06-01 09:00-03')$q$,'P0001','request key bound to arguments','idempotency_conflict');
select pg_temp.rejects($q$select pg_temp.book(21,52,32,'2099-06-01 09:00-03')$q$,'23P01','member cannot occupy two courts');
select pg_temp.rejects($q$select pg_temp.book(21,52,31,'2099-06-01 10:30-03')$q$,'P0001','zero credits rolls back new booking','payment_required_or_account_missing');
select pg_temp.check_that((select turns=0 from public.padel_credits where member_id=pg_temp.id(21)),'one credit consumed');
select set_config('request.jwt.claim.sub',pg_temp.id(2)::text,true);
select pg_temp.rejects($q$select pg_temp.book(24,53,31,'2099-06-01 09:00-03')$q$,'23P01','court already booked');
select pg_temp.check_that((select turns=1 from public.padel_credits where member_id=pg_temp.id(24)),'conflict preserves credit');
select pg_temp.book(24,53,31,'2099-06-01 10:30-03');
select set_config('request.jwt.claim.sub',pg_temp.id(1)::text,true);
select pg_temp.rejects(format('select public.padel_command(pg_temp.id(11),pg_temp.id(21),pg_temp.id(54),''move'',%L,1,pg_temp.id(31),''2099-06-01 10:30-03'')',:'reservation_id'),'23P01','conflicting move rolls back');
select pg_temp.check_that((select version=1 and starts_at='2099-06-01 09:00-03' from public.padel_occupancy where id=:'reservation_id'),'original booking preserved');
select public.padel_command(pg_temp.id(11),pg_temp.id(21),pg_temp.id(54),'move',:'reservation_id',1,pg_temp.id(32),'2099-06-01 12:00-03');
select pg_temp.check_that((select count(*)=2 from public.padel_movements where member_id=pg_temp.id(21)),'move creates no movement');
select pg_temp.rejects(format('select public.padel_command(pg_temp.id(11),pg_temp.id(21),pg_temp.id(55),''cancel'',%L,2)',:'reservation_id'),'P0001','missing eligibility fails closed','eligibility_unconfirmed');
reset role;
insert into pucara_private.cancellation_approvals values(pg_temp.id(11),:'reservation_id',2,'Synthetic test decision');
set local role authenticated;
select public.padel_command(pg_temp.id(11),pg_temp.id(21),pg_temp.id(55),'cancel',:'reservation_id',2);
select public.padel_command(pg_temp.id(11),pg_temp.id(21),pg_temp.id(55),'cancel',:'reservation_id',2);
select pg_temp.rejects(format('select public.padel_command(pg_temp.id(11),pg_temp.id(21),pg_temp.id(56),''cancel'',%L,2)',:'reservation_id'),'P0001','different request cannot cancel twice','reservation_conflict');
select pg_temp.check_that((select turns=1 from public.padel_credits where member_id=pg_temp.id(21)),'eligible cancellation restored exactly one turn');
select pg_temp.check_that((select count(*)=1 from public.padel_availability(pg_temp.id(11),'2099-06-01 12:00-03','2099-06-01 12:01-03') where court_id=pg_temp.id(32)),'cancelled slot released');
reset role;
select pg_temp.rejects(format('insert into public.padel_movements(club_id,member_id,reservation_id,reason,delta) values(pg_temp.id(11),pg_temp.id(21),%L,''cancellation'',1)',:'reservation_id'),'23505','ledger enforces refund uniqueness');
select pg_temp.check_that((select count(*)=3 from pucara_private.booking_audit where member_id=pg_temp.id(21)),'audit once per committed command');
select pg_temp.rejects($q$insert into public.padel_slots values(pg_temp.id(11),pg_temp.id(31),'2099-07-01 09:00Z','2099-07-01 10:00Z')$q$,'23514','invalid slot duration rejected');
select pg_temp.rejects($q$insert into pucara_private.guardians(club_id,user_id,member_id) values(pg_temp.id(11),pg_temp.id(2),pg_temp.id(25))$q$,'23503','foreign club member link rejected');
set local role authenticated;
select set_config('request.jwt.claim.sub',pg_temp.id(3)::text,true);
select pg_temp.check_that((select array_agg(id)=array[pg_temp.id(25)] from public.members),'second club sees only its own directory');
rollback;
