import { describe, it, expect } from 'vitest';
import { createDemoExperience, offsetClubDay } from '@pucara/shared';
import { calendarMonth, personalWeek, weekOf } from './calendar';
describe('calendario del socio', () => {
  const data = createDemoExperience('2026-12-31');
  it('centra la semana de lunes a domingo incluso al cambiar de año', () => {
    const days = weekOf('2027-01-03');
    expect(days).toEqual([
      '2026-12-28',
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
      '2027-01-03',
    ]);
    expect(calendarMonth(days[4]!)).toContain('2027');
    const next = offsetClubDay(days[3]!, 7);
    expect(weekOf(next)[0]).toBe('2027-01-04');
    expect(weekOf(offsetClubDay(next, -7))).toEqual(days);
  });
  it('incluye turnos, solicitudes de quincho, clases inscriptas y compromisos del titular', () => {
    const week = personalWeek(data, weekOf('2027-01-01'));
    expect(week.get('2026-12-31')?.map((e) => e.id)).toEqual([
      'plantel-practica',
    ]);
    expect(week.get('2027-01-01')?.map((e) => e.target.id)).toEqual([
      'padel-demo',
    ]);
    expect(week.get('2027-01-02')?.map((e) => e.target.id)).toEqual([
      'funcional',
    ]);
    expect(week.get('2027-01-03')?.map((e) => e.status)).toEqual(['pending']);
    expect(
      personalWeek(data, weekOf('2027-01-05'))
        .get('2027-01-05')
        ?.map((e) => e.target.id),
    ).toEqual(['funcional']);
  });
  it('ubica los eventos en días del club y respeta el fin exclusivo a medianoche', () => {
    const event = {
      id: 'especial',
      title: 'Práctica',
      location: 'Club',
      kind: 'training' as const,
      target: { kind: 'module' as const, id: 'rugby' as const },
      startsAt: '2027-01-02T02:00:00Z',
      endsAt: '2027-01-02T03:00:00Z',
    };
    const week = personalWeek(
      { ...data, scheduledEvents: [event] },
      weekOf('2027-01-01'),
    );
    expect(week.get('2027-01-01')).toContainEqual({
      ...event,
      personId: data.member.id,
    });
    expect(week.get('2027-01-02')).not.toContainEqual(event);
  });
});
