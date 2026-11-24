import { describe, it, expect } from 'vitest';
import { createDemoExperience, agendaItems, viewablePeople } from './index';
describe('vistas familiares de demostración', () => {
  const data = createDemoExperience('2026-11-20');
  it('relaciona cada carnet y agenda con el mismo socio', () => {
    const people = viewablePeople(data, 'card');
    expect(new Set(people.map((p) => p.number)).size).toBe(3);
    for (const p of people) {
      const items = agendaItems(data, p.id, data.referenceInstant);
      expect(items.length).toBeGreaterThan(0);
      expect(items.every((e) => e.personId === p.id)).toBe(true);
    }
    const all = agendaItems(data, 'all', data.referenceInstant);
    expect(new Set(all.map((x) => x.personId)).size).toBe(3);
    expect(
      all.some(
        (x) =>
          x.target.kind === 'match' ||
          x.target.id === 'gimnasio' ||
          x.target.id === 'yoga',
      ),
    ).toBe(false);
  });
  it('respeta el ámbito del vínculo y excluye identificadores desconocidos', () => {
    const limited = {
      ...data,
      family: data.family.map((f) => ({ ...f, scopes: ['profile'] as const })),
    };
    expect(viewablePeople(limited, 'card')).toEqual([data.member]);
    expect(agendaItems(limited, 'sofia-demo', data.referenceInstant)).toEqual(
      [],
    );
    expect(
      agendaItems(limited, 'all', data.referenceInstant).every(
        (e) => e.personId === data.member.id,
      ),
    ).toBe(true);
    expect(agendaItems(data, 'desconocido', data.referenceInstant)).toEqual([]);
  });
  it('la beca corresponde al menor y no altera el estado de membresía ni el saldo', () => {
    const benefit = data.account.scholarships[0]!;
    const child = data.family.find((f) => f.id === benefit.memberId)!;
    expect(child.firstName).toBe('Tomás');
    expect(benefit.percentage).toBe(50);
    expect(child.administrativeStatus).toBe('Activo');
    expect(data.account.amountDueMinor).toBe(0);
  });
});
