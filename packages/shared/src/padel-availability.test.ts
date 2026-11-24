import { describe, expect, it } from 'vitest';
import { demoClub } from './demo';
import { createDemoPadelReader } from './demo-padel-availability';
import { offsetClubDay, padelDayQuery } from './padel-availability';

const firstDay = '2026-12-31';
const reader = createDemoPadelReader(firstDay, 3925050);
const query = padelDayQuery(demoClub.id, firstDay);
describe('padel availability reader', () => {
  it('queries a half-open Buenos Aires civil day across a year boundary', () => {
    expect(query).toEqual({
      p_club: demoClub.id,
      p_from: '2026-12-31T00:00:00-03:00',
      p_until: '2027-01-01T00:00:00-03:00',
    });
    expect(offsetClubDay('2028-02-28', 1)).toBe('2028-02-29');
  });
  it('returns configured prices and raw RPC columns separately from the court directory', async () => {
    const { slots, courts } = await reader.read(query, { aborted: false });
    expect(slots).toHaveLength(5);
    expect(courts).toHaveLength(1);
    expect(slots[0]).toEqual({
      court_id: courts[0]?.id,
      starts_at: firstDay + 'T12:30:00-03:00',
      ends_at: firstDay + 'T14:00:00-03:00',
      price_minor: 3925050,
    });
  });
  it('returns only rows inside the requested instant range and an empty sample day', async () => {
    const signal = { aborted: false };
    const subset = await reader.read(
      {
        ...query,
        p_from: firstDay + 'T15:30:00Z',
        p_until: firstDay + 'T18:30:00Z',
      },
      signal,
    );
    expect(subset.slots).toHaveLength(1);
    expect(
      (
        await reader.read(
          padelDayQuery(demoClub.id, offsetClubDay(firstDay, 5)),
          signal,
        )
      ).slots,
    ).toEqual([]);
  });
  it('rejects other clubs, cancelled reads and accidental production mode', async () => {
    const signal = { aborted: false };
    await expect(
      reader.read({ ...query, p_club: 'other' }, signal),
    ).rejects.toThrow();
    signal.aborted = true;
    await expect(reader.read(query, signal)).rejects.toThrow();
    expect(() => createDemoPadelReader(firstDay, 100, 'live')).toThrow();
  });
});
