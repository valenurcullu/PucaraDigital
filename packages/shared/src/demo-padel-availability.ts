import { demoClub } from './demo';
import {
  offsetClubDay,
  type PadelAvailabilityReader,
  type PadelSlot,
} from './padel-availability';
import { requireDemoMode } from './services';

const courts = [
  { id: '00000000-0000-4000-8000-000000000031', name: 'Cancha 1' },
  { id: '00000000-0000-4000-8000-000000000032', name: 'Cancha 2' },
] as const;

// Canned RPC results. Day two intentionally has an empty response.
const examples = [
  { day: 0, court: 0, start: '09:00', end: '10:30' },
  { day: 0, court: 1, start: '10:30', end: '12:00' },
  { day: 0, court: 0, start: '15:00', end: '16:30' },
  { day: 0, court: 1, start: '19:30', end: '21:00' },
  { day: 2, court: 1, start: '12:00', end: '13:30' },
  { day: 3, court: 0, start: '18:00', end: '19:30' },
] as const;

export function createDemoPadelReader(
  firstDay: string,
  priceMinor: number,
  mode?: string,
): PadelAvailabilityReader {
  requireDemoMode(mode);
  const rows: PadelSlot[] = examples.map(({ day, court, start, end }) => {
    const date = offsetClubDay(firstDay, day);
    return {
      court_id: courts[court].id,
      starts_at: date + 'T' + start + ':00-03:00',
      ends_at: date + 'T' + end + ':00-03:00',
      price_minor: priceMinor,
    };
  });
  return {
    async read({ p_club, p_from, p_until }, signal) {
      if (signal.aborted) throw new Error('Lectura cancelada');
      if (p_club !== demoClub.id) throw new Error('Club demo desconocido');
      const from = Date.parse(p_from);
      const until = Date.parse(p_until);
      return {
        courts,
        slots: rows.filter((row) => {
          const start = Date.parse(row.starts_at);
          return start >= from && start < until;
        }),
      };
    },
  };
}
