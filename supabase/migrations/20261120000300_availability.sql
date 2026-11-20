-- Show free published slots without exposing the identity of other players.
create function public.padel_availability(p_club uuid,p_from timestamptz,p_until timestamptz)
returns table(court_id uuid,starts_at timestamptz,ends_at timestamptz,price_minor integer)
language sql stable security definer set search_path='' as $$
 select s.court_id,s.starts_at,s.ends_at,c.price_minor
 from public.padel_slots s join public.padel_courts c on (c.club_id,c.id)=(s.club_id,s.court_id)
 where s.club_id=p_club and pucara_private.allowed(p_club,null,'club.read')
 and s.starts_at >= greatest(now(),p_from) and s.starts_at < p_until
 and not exists (select 1 from public.padel_occupancy o where o.club_id=s.club_id and o.court_id=s.court_id
   and o.status='active' and tstzrange(o.starts_at,o.ends_at,'[)') && tstzrange(s.starts_at,s.ends_at,'[)'))
 order by s.starts_at,s.court_id
$$;
grant create on schema public to pucara_booking;
alter function public.padel_availability(uuid,timestamptz,timestamptz) owner to pucara_booking;
revoke create on schema public from pucara_booking;
revoke all on function public.padel_availability(uuid,timestamptz,timestamptz) from public, anon, authenticated;
grant execute on function public.padel_availability(uuid,timestamptz,timestamptz) to authenticated;
