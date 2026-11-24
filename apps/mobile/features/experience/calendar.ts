import {
  clubDay,
  clubTimeZone,
  offsetClubDay,
  agendaItems,
  type AgendaItem,
  type MemberExperience,
} from '@pucara/shared';
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

const monthYear = new Intl.DateTimeFormat('es-AR', {
  timeZone: clubTimeZone,
  month: 'long',
  year: 'numeric',
});
export function calendarMonth(day: string) {
  return monthYear
    .format(new Date(day + 'T12:00:00Z'))
    .replace(' de ', ' ')
    .replace(/^./, (l) => l.toUpperCase());
}
export function mondayOf(day: string) {
  const weekday = new Date(day + 'T12:00:00Z').getUTCDay();
  return offsetClubDay(day, -((weekday + 6) % 7));
}
export function weekOf(day: string) {
  const monday = mondayOf(day);
  return Array.from({ length: 7 }, (_, i) => offsetClubDay(monday, i));
}
export function personalWeek(
  data: MemberExperience,
  days: readonly string[],
  person = data.member.id,
): Map<string, AgendaItem[]> {
  const first = days[0];
  if (!first) return new Map();
  const events = agendaItems(data, person, first + 'T00:00:00-03:00').map(
    (event) => ({
      event,
      start: clubDay(new Date(event.startsAt)),
      last: clubDay(new Date(Date.parse(event.endsAt) - 1)),
    }),
  );
  return new Map(
    days.map((day) => [
      day,
      events
        .filter(({ start, last }) => start <= day && day <= last)
        .map(({ event }) => event),
    ]),
  );
}
