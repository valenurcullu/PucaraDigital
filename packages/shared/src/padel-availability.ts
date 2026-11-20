/** JSON contract of public.padel_availability. Timestamps include their UTC offset. */
export interface PadelAvailabilityQuery {
  readonly p_club: string;
  readonly p_from: string;
  readonly p_until: string;
}
export interface PadelSlot {
  readonly court_id: string;
  readonly starts_at: string;
  readonly ends_at: string;
  readonly price_minor: number;
}
export interface PadelAvailability {
  readonly slots: readonly PadelSlot[];
  /** Separate projection of padel_courts, scoped to the queried club. */
  readonly courts: readonly { readonly id: string; readonly name: string }[];
}
type ReadSignal = { readonly aborted: boolean };
export interface PadelAvailabilityReader<
  Signal extends ReadSignal = ReadSignal,
> {
  read(
    query: PadelAvailabilityQuery,
    signal: Signal,
  ): Promise<PadelAvailability>;
}

/** Calendar arithmetic on ISO dates, independent of the handset's time zone. */
export function offsetClubDay(day: string, days: number) {
  const date = new Date(day + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function padelDayQuery(
  clubId: string,
  day: string,
): PadelAvailabilityQuery {
  // Pucará's current civil time in Buenos Aires is UTC−03.
  return {
    p_club: clubId,
    p_from: day + 'T00:00:00-03:00',
    p_until: offsetClubDay(day, 1) + 'T00:00:00-03:00',
  };
}
