import { describe, expect, it } from 'vitest';
import {
  clubDay,
  createDemoExperience,
  createDemoExperienceReader,
  selectFirstTeamMatches,
  selectPersonalEvents,
} from './index';

describe('member read model', () => {
  it('uses the club date across UTC midnight and rejects invalid dates', () => {
    expect(clubDay(new Date('2026-11-13T01:00:00Z'))).toBe('2026-11-12');
    expect(() => createDemoExperience('2026-02-31')).toThrow();
    expect(() => createDemoExperience('invalid')).toThrow();
  });
  it('includes only confirmed reservations and enrolled participant classes', () => {
    const data = createDemoExperience('2026-11-12');
    expect(selectPersonalEvents(data).map((e) => e.id)).toEqual([
      'reservation-padel-demo',
      'funcional-1',
      'funcional-2',
    ]);
    expect(
      selectPersonalEvents({
        ...data,
        activities: data.activities.map((a) => ({ ...a, enrollment: 'none' })),
      }),
    ).toHaveLength(1);
    expect(
      selectPersonalEvents({
        ...data,
        activities: data.activities.map((a) => ({
          ...a,
          participantId: 'another-member',
        })),
      }),
    ).toHaveLength(1);
    expect(selectPersonalEvents(data, '2027-01-01T00:00:00Z')).toEqual([]);
    expect(
      selectPersonalEvents({ ...data, reservations: [], activities: [] }),
    ).toEqual([]);
  });
  it('returns the next Primera of each sport without mutating source order', () => {
    const data = createDemoExperience('2026-11-12');
    const first = data.matches[0]!;
    const matches = [
      ...data.matches,
      { ...first, id: 'old', startsAt: '2020-01-01T10:00:00Z' },
      { ...first, id: 'youth', division: 'Juveniles' },
    ];
    expect(
      selectFirstTeamMatches({ ...data, matches }).map((m) => m.id),
    ).toEqual(['rugby-primera', 'hockey-primera']);
    expect(matches[2]?.id).toBe('old');
    expect(selectFirstTeamMatches({ ...data, matches: [] })).toEqual([]);
  });
  it('keeps module destinations valid and the padel fixture at exactly 90 minutes', () => {
    const data = createDemoExperience('2026-11-12');
    const ids = data.modules.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const group of data.groups)
      for (const id of group.modules) expect(ids).toContain(id);
    for (const event of selectPersonalEvents(data)) {
      if (event.target.kind === 'module')
        expect(ids).toContain(event.target.id);
      if (event.target.kind === 'reservation')
        expect(data.reservations.some((r) => r.id === event.target.id)).toBe(
          true,
        );
    }
    const padel = data.reservations.find((r) => r.resource === 'padel')!;
    expect(
      (Date.parse(padel.endsAt) - Date.parse(padel.startsAt)) / 60000,
    ).toBe(90);
    expect(data.padel.priceMinor).toBe(4000000);
  });
  it('rejects unsupported live mode, honours abort and creates independent snapshots', async () => {
    expect(() => createDemoExperienceReader('live')).toThrow();
    const reader = createDemoExperienceReader();
    const controller = { signal: { aborted: true } };
    await expect(reader.read(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    const first = await reader.read({ aborted: false });
    const second = await reader.read({ aborted: false });
    expect(first).not.toBe(second);
    expect(first.reservations).not.toBe(second.reservations);
  });
});
