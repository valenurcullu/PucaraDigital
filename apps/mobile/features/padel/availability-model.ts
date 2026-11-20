import type {
  PadelAvailability,
  PadelAvailabilityQuery,
  PadelAvailabilityReader,
  PadelSlot,
} from '@pucara/shared';
import { clubTimeZone } from '@pucara/shared';
import { formatMoney, formatTime } from '../experience/navigation';

export type AvailabilityState =
  | { status: 'loading' | 'empty' | 'error' }
  | { status: 'ready'; courts: ReturnType<typeof groupByCourt> };

function groupByCourt(data: PadelAvailability) {
  const names = new Map(data.courts.map((court) => [court.id, court.name]));
  const groups = new Map<
    string,
    { id: string; name: string; slots: PadelSlot[] }
  >();
  for (const slot of data.slots) {
    let group = groups.get(slot.court_id);
    if (!group) {
      const name = names.get(slot.court_id);
      if (!name) throw new Error('Falta el nombre de la cancha');
      group = { id: slot.court_id, name, slots: [] };
      groups.set(slot.court_id, group);
    }
    group.slots.push(slot);
  }
  return [...groups.values()];
}

export async function loadAvailability(
  reader: PadelAvailabilityReader<AbortSignal>,
  query: PadelAvailabilityQuery,
  signal: AbortSignal,
  publish: (state: AvailabilityState) => void,
) {
  if (signal.aborted) return;
  publish({ status: 'loading' });
  try {
    const result = await reader.read(query, signal);
    if (!signal.aborted)
      publish(
        result.slots.length
          ? { status: 'ready', courts: groupByCourt(result) }
          : { status: 'empty' },
      );
  } catch {
    if (!signal.aborted) publish({ status: 'error' });
  }
}
const weekday = new Intl.DateTimeFormat('es-AR', {
  timeZone: clubTimeZone,
  weekday: 'short',
});
const fullDay = new Intl.DateTimeFormat('es-AR', {
  timeZone: clubTimeZone,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
export function dayLabels(day: string) {
  const noon = new Date(day + 'T12:00:00-03:00');
  return {
    weekday: weekday.format(noon),
    number: String(noon.getUTCDate()),
    full: fullDay.format(noon),
  };
}
export function slotLabels(slot: PadelSlot) {
  const minutes =
    (Date.parse(slot.ends_at) - Date.parse(slot.starts_at)) / 60000;
  return {
    start: formatTime(slot.starts_at),
    end: formatTime(slot.ends_at),
    duration: minutes + ' min',
    price: formatMoney(slot.price_minor),
  };
}
