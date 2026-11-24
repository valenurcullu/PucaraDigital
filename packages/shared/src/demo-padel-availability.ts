import { demoClub } from './demo';
import {
  offsetClubDay,
  type PadelAvailabilityReader,
  type PadelSlot,
} from './padel-availability';
import { requireDemoMode } from './services';

export const demoPadelCourt = {
  id: '00000000-0000-4000-8000-000000000031',
  name: 'Cancha de pádel',
};
// Published sample availability for the fourteen demo days. No production scheduling logic.
const times = [
  ['08:00', '09:30'],
  ['09:30', '11:00'],
  ['11:00', '12:30'],
  ['12:30', '14:00'],
  ['14:00', '15:30'],
  ['15:30', '17:00'],
  ['17:00', '18:30'],
  ['18:30', '20:00'],
  ['20:00', '21:30'],
  ['21:30', '23:00'],
] as const;
const published = [
  [3, 5, 6, 8, 9],
  [0, 2, 3, 4, 5, 7, 8, 9],
  [2, 8],
  [1, 3, 4, 5, 6, 7, 9],
  [0, 1, 2, 3, 5, 6, 7],
  [],
  [0, 4, 7],
  [3, 4, 5],
  [0, 1, 6],
  [1, 4, 5, 7],
  [3, 5, 9],
  [1, 7],
  [],
  [2, 3, 4, 6, 9],
];
export function createDemoPadelReader(
  firstDay: string,
  priceMinor: number,
  mode?: string,
  occupied: readonly string[] = [],
): PadelAvailabilityReader {
  requireDemoMode(mode);
  const held = new Set(occupied.map((value) => Date.parse(value)));
  const slots: PadelSlot[] = published.flatMap((indices, offset) => {
    const date = offsetClubDay(firstDay, offset);
    return indices.map((index) => {
      const [start, end] = times[index]!;
      return {
        court_id: demoPadelCourt.id,
        starts_at: date + 'T' + start + ':00-03:00',
        ends_at: date + 'T' + end + ':00-03:00',
        price_minor: priceMinor,
      };
    });
  });
  return {
    async read({ p_club, p_from, p_until }, signal) {
      if (signal.aborted) throw new Error('Lectura cancelada');
      if (p_club !== demoClub.id) throw new Error('Club demo desconocido');
      const from = Date.parse(p_from),
        until = Date.parse(p_until);
      return {
        courts: [demoPadelCourt],
        slots: slots.filter((row) => {
          const at = Date.parse(row.starts_at);
          return at >= from && at < until && !held.has(at);
        }),
      };
    },
  };
}
