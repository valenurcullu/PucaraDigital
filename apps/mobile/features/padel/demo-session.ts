import type {
  MemberExperience,
  MemberReservation,
  PadelSlot,
} from '@pucara/shared';
// Ephemeral example receipts only. A future authenticated adapter must submit commands to PostgreSQL.
export type DemoPadelIntent =
  | { action: 'book'; id: string; slot: PadelSlot; method: 'credit' | 'pay' }
  | { action: 'move'; id: string; slot: PadelSlot }
  | { action: 'cancel'; id: string; exampleEligible: boolean };
export function previewPadel(
  data: MemberExperience,
  intent: DemoPadelIntent,
): MemberExperience | undefined {
  const old = data.reservations.find((r) => r.id === intent.id);
  let turns = data.padel.availableCredits;
  let reservations: readonly MemberReservation[];
  if (intent.action === 'cancel') {
    if (old?.resource !== 'padel' || old.status !== 'confirmed') return;
    reservations = data.reservations.map((r) =>
      r === old ? { ...r, status: 'cancelled' } : r,
    );
    if (intent.exampleEligible) turns++;
  } else {
    const slot = intent.slot;
    if (
      data.reservations.some(
        (r) =>
          r.resource === 'padel' &&
          r.status === 'confirmed' &&
          Date.parse(r.startsAt) === Date.parse(slot.starts_at),
      )
    )
      return;
    if (intent.action === 'move') {
      if (old?.resource !== 'padel' || old.status !== 'confirmed') return;
      reservations = data.reservations.map((r) =>
        r === old
          ? { ...r, startsAt: slot.starts_at, endsAt: slot.ends_at }
          : r,
      );
    } else {
      if (old || (intent.method === 'credit' && turns === 0)) return;
      if (intent.method === 'credit') turns--;
      reservations = [
        ...data.reservations,
        {
          id: intent.id,
          resource: 'padel',
          title: 'Pádel',
          location: 'Cancha de pádel',
          status: 'confirmed',
          demoPayment: intent.method,
          startsAt: slot.starts_at,
          endsAt: slot.ends_at,
        },
      ];
    }
  }
  return {
    ...data,
    reservations,
    padel: { ...data.padel, availableCredits: turns },
  };
}
