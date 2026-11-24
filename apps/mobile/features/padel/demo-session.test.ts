import { describe, it, expect } from 'vitest';
import {
  createDemoExperience,
  selectPersonalEvents,
  createDemoPadelReader,
  padelDayQuery,
  demoClub,
} from '@pucara/shared';
import { previewPadel } from './demo-session';
describe('Recibos de la sesión demo', () => {
  it.each(['credit', 'pay'] as const)(
    'reserva con %s, modifica, cancela una sola vez y actualiza Agenda',
    async (method) => {
      const initial = createDemoExperience('2026-11-20');
      const { slots } = await createDemoPadelReader('2026-11-20', 4000000).read(
        padelDayQuery(demoClub.id, '2026-11-21'),
        { aborted: false },
      );
      const slot = slots[0]!,
        other = slots[1]!;
      const book = { action: 'book', method, slot, id: 'test-turn' } as const;
      const booked = previewPadel(initial, book)!;
      expect(booked.padel.availableCredits).toBe(
        initial.padel.availableCredits - (method === 'credit' ? 1 : 0),
      );
      expect(previewPadel(booked, book)).toBeUndefined();
      const moved = previewPadel(booked, {
        action: 'move',
        id: book.id,
        slot: other,
      })!;
      expect(moved.padel.availableCredits).toBe(booked.padel.availableCredits);
      const event = selectPersonalEvents(moved).find(
        (e) => e.target.id === book.id,
      );
      expect(event?.startsAt).toBe(other.starts_at);
      const old = initial.reservations.find((r) => r.id === 'padel-demo')!;
      expect(
        previewPadel(moved, {
          action: 'move',
          id: book.id,
          slot: { ...slot, starts_at: old.startsAt },
        }),
      ).toBeUndefined();
      const cancel = {
        action: 'cancel',
        id: book.id,
        exampleEligible: true,
      } as const;
      const cancelled = previewPadel(moved, cancel)!;
      expect(cancelled.padel.availableCredits).toBe(
        moved.padel.availableCredits + 1,
      );
      expect(previewPadel(cancelled, cancel)).toBeUndefined();
      expect(
        selectPersonalEvents(cancelled).some((e) => e.target.id === book.id),
      ).toBe(false);
      expect(
        previewPadel(moved, { ...cancel, exampleEligible: false })?.padel
          .availableCredits,
      ).toBe(moved.padel.availableCredits);
      expect(
        previewPadel(
          { ...initial, padel: { ...initial.padel, availableCredits: 0 } },
          { ...book, method: 'credit' },
        ),
      ).toBeUndefined();
    },
  );
});
