create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;

create table public.padel_courts (
  club_id uuid references public.clubs,
  id uuid default gen_random_uuid(),
  name text not null,
  price_minor integer not null default 4000000 check (price_minor > 0),
  primary key (club_id,id)
);
create table public.padel_slots (
  club_id uuid not null,
  court_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  primary key (club_id,court_id,starts_at,ends_at),
  foreign key (club_id,court_id) references public.padel_courts,
  check (ends_at - starts_at = interval '90 minutes')
);
-- Both bookings and staff blocks compete in the SAME exclusion index.
create table public.padel_occupancy (
  club_id uuid not null,
  id uuid default gen_random_uuid(),
  court_id uuid not null,
  member_id uuid,
  kind text not null check (kind in ('reservation','block')),
  status text not null default 'active' check (status in ('active','cancelled')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  slot_start timestamptz generated always as (case when kind='reservation' then starts_at end) stored,
  price_minor integer,
  version integer not null default 1 check (version > 0),
  primary key (club_id,id),
  unique (club_id,member_id,id),
  foreign key (club_id,court_id) references public.padel_courts,
  foreign key (club_id,member_id) references public.members,
  foreign key (club_id,court_id,slot_start,ends_at) references public.padel_slots,
  check (isfinite(starts_at) and isfinite(ends_at) and ends_at > starts_at),
  check ((kind='block' and member_id is null and price_minor is null)
      or (kind='reservation' and member_id is not null and price_minor is not null and price_minor > 0)),
  exclude using gist (club_id with =, court_id with =, tstzrange(starts_at,ends_at,'[)') with &&)
    where (status='active'),
  exclude using gist (club_id with =, member_id with =, tstzrange(starts_at,ends_at,'[)') with &&)
    where (kind='reservation' and status='active')
);
create table public.padel_credits (
  club_id uuid not null,
  member_id uuid not null,
  turns integer not null default 0 check (turns >= 0),
  primary key (club_id,member_id),
  foreign key (club_id,member_id) references public.members
);
create table public.padel_movements (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null,
  member_id uuid not null,
  reservation_id uuid,
  reason text not null,
  delta smallint not null,
  created_at timestamptz not null default now(),
  foreign key (club_id,member_id) references public.padel_credits,
  foreign key (club_id,member_id,reservation_id) references public.padel_occupancy (club_id,member_id,id),
  unique (club_id,reservation_id,reason),
  check ((reason='opening' and delta=1 and reservation_id is null)
      or (reason='booking' and delta=-1 and reservation_id is not null)
      or (reason='cancellation' and delta=1 and reservation_id is not null))
);
-- Positive eligibility is provisioned by a trusted operator for this exact version.
create table pucara_private.cancellation_approvals (
  club_id uuid not null,
  reservation_id uuid not null,
  version integer not null,
  rationale text not null check (length(trim(rationale)) > 0),
  primary key (club_id,reservation_id,version),
  foreign key (club_id,reservation_id) references public.padel_occupancy
);
create table pucara_private.booking_audit (
  club_id uuid not null,
  actor_id uuid not null,
  request_id uuid not null,
  member_id uuid not null,
  reservation_id uuid not null,
  arguments jsonb not null,
  result_version integer not null,
  previous_start timestamptz,
  created_at timestamptz not null default now(),
  primary key (club_id,actor_id,request_id),
  foreign key (club_id,actor_id) references pucara_private.memberships,
  foreign key (club_id,member_id,reservation_id) references public.padel_occupancy (club_id,member_id,id)
);
revoke all on pucara_private.booking_audit,pucara_private.cancellation_approvals from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['padel_courts','padel_slots','padel_occupancy','padel_credits','padel_movements'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    execute format('grant select on public.%I to authenticated, pucara_booking', t);
    execute format('create policy booking_worker on public.%I to pucara_booking using (true) with check (true)', t);
  end loop;
end $$;
create policy court_read on public.padel_courts for select to authenticated using (pucara_private.allowed(club_id,null,'club.read'));
create policy slot_read on public.padel_slots for select to authenticated using (pucara_private.allowed(club_id,null,'club.read'));
create policy reservation_read on public.padel_occupancy for select to authenticated using (pucara_private.allowed(club_id,member_id,'member.read'));
create policy credits_read on public.padel_credits for select to authenticated using (pucara_private.allowed(club_id,member_id,'padel.self'));
create policy movement_read on public.padel_movements for select to authenticated using (pucara_private.allowed(club_id,member_id,'padel.self'));

grant insert, update on public.padel_occupancy to pucara_booking;
grant update (turns) on public.padel_credits to pucara_booking;
grant insert on public.padel_movements to pucara_booking;
grant select, insert on pucara_private.booking_audit to pucara_booking;
grant select on pucara_private.cancellation_approvals to pucara_booking;

-- A movement and its balance update either both commit or both roll back.
create function pucara_private.apply_turn() returns trigger language plpgsql set search_path='' as $$
begin
  update public.padel_credits set turns=turns+new.delta
    where club_id=new.club_id and member_id=new.member_id and turns+new.delta >= 0;
  if not found then raise exception 'payment_required_or_account_missing'; end if;
  return new;
end $$;
revoke all on function pucara_private.apply_turn() from public, anon, authenticated;
create trigger apply_movement before insert on public.padel_movements
  for each row execute function pucara_private.apply_turn();

create function public.padel_command(
  p_club uuid, p_member uuid, p_request uuid, p_action text,
  p_reservation uuid default null, p_version integer default null,
  p_court uuid default null, p_start timestamptz default null
) returns uuid language plpgsql security definer set search_path='' set timezone='UTC' as $$
declare
  actor uuid := auth.uid();
  args jsonb := jsonb_build_array(p_action,p_reservation,p_version,p_court,p_start);
  prior pucara_private.booking_audit%rowtype;
  booking public.padel_occupancy%rowtype;
  old_start timestamptz;
  price integer;
begin
  if not pucara_private.allowed(p_club,p_member,'padel.self') then
    raise insufficient_privilege using message='member_access_denied';
  end if;
  if p_request is null or p_action is null or p_action not in ('book','move','cancel') then
    raise exception 'invalid_command';
  end if;
  -- Serialize the member's commands even if they target different courts.
  perform 1 from public.padel_credits where club_id=p_club and member_id=p_member for update;
  if not found then raise exception 'credit_account_missing'; end if;
  select * into prior from pucara_private.booking_audit
    where club_id=p_club and actor_id=actor and request_id=p_request;
  if found then
    if prior.arguments <> args or prior.member_id <> p_member then raise exception 'idempotency_conflict'; end if;
    return prior.reservation_id;
  end if;

  if p_action in ('book','move') then
    if p_start is null or p_start <= now() then raise exception 'future_slot_required'; end if;
    select price_minor into strict price from public.padel_courts where club_id=p_club and id=p_court;
  elsif p_court is not null or p_start is not null then raise exception 'unexpected_slot';
  end if;

  if p_action='book' then
    if p_reservation is not null or p_version is not null then raise exception 'unexpected_reservation'; end if;
    insert into public.padel_occupancy (club_id,court_id,member_id,kind,starts_at,ends_at,price_minor)
      values (p_club,p_court,p_member,'reservation',p_start,p_start+interval '90 minutes',price)
      returning * into booking;
    insert into public.padel_movements (club_id,member_id,reservation_id,reason,delta)
      values (p_club,p_member,booking.id,'booking',-1);
  else
    select * into strict booking from public.padel_occupancy
      where club_id=p_club and id=p_reservation and member_id=p_member and kind='reservation' for update;
    if booking.status <> 'active' or booking.version is distinct from p_version or booking.starts_at <= now() then
      raise exception 'reservation_conflict';
    end if;
    old_start := booking.starts_at;
    if p_action='move' then
      update public.padel_occupancy set court_id=p_court, starts_at=p_start, ends_at=p_start+interval '90 minutes', version=version+1
        where club_id=p_club and id=booking.id returning * into booking;
    else
      if not exists (select from pucara_private.cancellation_approvals where club_id=p_club
        and reservation_id=booking.id and version=booking.version) then raise exception 'eligibility_unconfirmed'; end if;
      update public.padel_occupancy set status='cancelled', version=version+1 where club_id=p_club and id=booking.id returning * into booking;
      insert into public.padel_movements (club_id,member_id,reservation_id,reason,delta)
        values (p_club,p_member,booking.id,'cancellation',1);
    end if;
  end if;
  insert into pucara_private.booking_audit(club_id,actor_id,request_id,member_id,reservation_id,arguments,result_version,previous_start)
    values (p_club,actor,p_request,p_member,booking.id,args,booking.version,old_start);
  return booking.id;
end $$;

grant create on schema public to pucara_booking;
alter function public.padel_command(uuid,uuid,uuid,text,uuid,integer,uuid,timestamptz) owner to pucara_booking;
revoke create on schema public from pucara_booking;
revoke all on function public.padel_command(uuid,uuid,uuid,text,uuid,integer,uuid,timestamptz) from public, anon, authenticated;
grant execute on function public.padel_command(uuid,uuid,uuid,text,uuid,integer,uuid,timestamptz) to authenticated;
