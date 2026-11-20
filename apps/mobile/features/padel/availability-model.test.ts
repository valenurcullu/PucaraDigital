import { dayLabels } from '../experience/calendar';
import { describe, expect, it, vi } from 'vitest';
import {
  padelDayQuery,
  type PadelAvailability,
  type PadelSlot,
} from '@pucara/shared';
import {
  loadAvailability,
  slotLabels,
  type AvailabilityState,
} from './availability-model';

const day = '2027-01-01';
const query = padelDayQuery('test-club', day);
const slot: PadelSlot = {
  court_id: 'court-a',
  starts_at: '2027-01-02T01:00:00Z',
  ends_at: '2027-01-02T02:30:00Z',
  price_minor: 3925050,
};
const data: PadelAvailability = {
  slots: [slot],
  courts: [{ id: slot.court_id, name: 'Cancha Norte' }],
};
describe('native availability presentation', () => {
  it('uses club time, returned duration and centavos to present a selected slot', () => {
    const labels = slotLabels(slot);
    expect(labels).toMatchObject({
      start: '22:00',
      end: '23:30',
      duration: '90 min',
    });
    expect(labels.price.replace(/\s/g, '')).toBe('$39.250,50');
    expect(dayLabels(day).full).toContain('viernes');
    expect(dayLabels(day).number).toBe('1');
  });
  it('groups returned slots under their catalog names, preserving the RPC order', async () => {
    const states: AvailabilityState[] = [];
    const second = { ...slot, court_id: 'court-b' };
    const next = {
      ...slot,
      starts_at: '2027-01-02T02:30:00Z',
      ends_at: '2027-01-02T04:00:00Z',
    };
    await loadAvailability(
      {
        read: async () => ({
          slots: [slot, second, next],
          courts: [...data.courts, { id: 'court-b', name: 'Cancha Sur' }],
        }),
      },
      query,
      new AbortController().signal,
      (state) => states.push(state),
    );
    expect(states).toEqual([
      { status: 'loading' },
      {
        status: 'ready',
        courts: [
          { id: 'court-a', name: 'Cancha Norte', slots: [slot, next] },
          { id: 'court-b', name: 'Cancha Sur', slots: [second] },
        ],
      },
    ]);
  });
  it('shows an empty result independently of an error', async () => {
    const publish = vi.fn();
    await loadAvailability(
      { read: async () => ({ ...data, slots: [] }) },
      query,
      new AbortController().signal,
      publish,
    );
    expect(publish).toHaveBeenLastCalledWith({ status: 'empty' });
  });
  it('recovers from a failed read when the same date is retried', async () => {
    const read = vi
      .fn()
      .mockRejectedValueOnce(new Error())
      .mockResolvedValueOnce(data);
    const statuses: string[] = [];
    const attempt = () =>
      loadAvailability({ read }, query, new AbortController().signal, (s) =>
        statuses.push(s.status),
      );
    await attempt();
    await attempt();
    expect(statuses).toEqual(['loading', 'error', 'loading', 'ready']);
    expect(read.mock.calls.map((args) => args[0])).toEqual([query, query]);
  });
  it('ignores late results and errors from a date that has been left', async () => {
    for (const reject of [false, true]) {
      const controller = new AbortController();
      const publish = vi.fn();
      const pending = loadAvailability(
        {
          read: async () => {
            await Promise.resolve();
            if (reject) throw new Error();
            return data;
          },
        },
        query,
        controller.signal,
        publish,
      );
      controller.abort();
      await pending;
      expect(publish.mock.calls).toEqual([[{ status: 'loading' }]]);
    }
  });
  it('reports incomplete court metadata as a retryable error', async () => {
    const publish = vi.fn();
    await loadAvailability(
      { read: async () => ({ ...data, courts: [] }) },
      query,
      new AbortController().signal,
      publish,
    );
    expect(publish).toHaveBeenLastCalledWith({ status: 'error' });
  });
});
