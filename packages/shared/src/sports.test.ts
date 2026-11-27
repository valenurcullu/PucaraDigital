import { describe, it, expect } from 'vitest';
import {
  createDemoExperience,
  previewSports,
  lastSet,
  workoutMetrics,
  agendaItems,
  type MemberExperience,
  type SportsIntent,
} from './index';
const fixture = () => createDemoExperience('2026-11-27');
const apply = (data: MemberExperience, intent: SportsIntent) => {
  const next = previewSports(data, intent);
  expect(next).toBeDefined();
  return next!;
};
describe('inscripciones de actividades por persona', () => {
  it.each(['yoga', 'funcional'] as const)(
    'inscribe %s con cupos, protege reintentos y conserva clases pasadas',
    (activityId) => {
      let data = fixture();
      const activity = data.activities.find((a) => a.id === activityId)!;
      const personId = activityId === 'yoga' ? data.member.id : 'sofia-demo';
      const at = '2026-11-27T12:00:00-03:00';
      const before = activity.availablePlaces;
      const join = { action: 'enroll', personId, activityId, at } as const;
      data = apply(data, join);
      expect(previewSports(data, join)).toBeUndefined();
      expect(
        data.activities.find((a) => a.id === activityId)?.availablePlaces,
      ).toBe(before - 1);
      const own = agendaItems(data, personId, data.referenceInstant).filter(
        (e) => e.target.id === activityId,
      );
      expect(own).toHaveLength(8);
      const other = personId === data.member.id ? 'sofia-demo' : data.member.id;
      expect(
        agendaItems(data, other, data.referenceInstant).some(
          (e) => e.target.id === activityId,
        ),
      ).toBe(activityId === 'funcional');
      const cancel = {
        action: 'unenroll',
        personId,
        activityId,
        at: activity.sessions[1]!.endsAt,
      } as const;
      const cancelled = apply(data, cancel);
      expect(
        cancelled.activities.find((a) => a.id === activityId)?.availablePlaces,
      ).toBe(before);
      expect(previewSports(cancelled, cancel)).toBeUndefined();
      expect(
        agendaItems(cancelled, personId, activity.sessions[1]!.endsAt).filter(
          (e) => e.target.id === activityId,
        ),
      ).toEqual([]);
      expect(
        agendaItems(cancelled, personId, data.referenceInstant)
          .filter((e) => e.target.id === activityId)
          .map((e) => e.id),
      ).toEqual([activityId + '-1', activityId + '-2']);
      const again = apply(cancelled, { ...join, at: cancel.at });
      expect(
        new Set(
          again.sports.enrollments
            .find(
              (e) => e.personId === personId && e.activityId === activityId,
            )!
            .classes.map((c) => c.id),
        ).size,
      ).toBe(8);
    },
  );
  it('rechaza cupo agotado, persona ajena y vínculo revocado', () => {
    const data = fixture();
    const full = {
      ...data,
      activities: data.activities.map((a) => ({ ...a, availablePlaces: 1 })),
    };
    const join = {
      action: 'enroll',
      personId: 'sofia-demo',
      activityId: 'yoga',
      at: data.referenceInstant,
    } as const;
    const last = apply(full, join);
    expect(last.activities[0]?.availablePlaces).toBe(0);
    expect(
      previewSports(last, { ...join, personId: 'tomas-demo' }),
    ).toBeUndefined();
    expect(
      previewSports(data, { ...join, personId: 'otra-persona' }),
    ).toBeUndefined();
    expect(
      previewSports(
        { ...data, family: data.family.map((p) => ({ ...p, scopes: [] })) },
        join,
      ),
    ).toBeUndefined();
  });
  it('una baja inicial de Funcional conserva sesiones anteriores', () => {
    const data = fixture();
    const activity = data.activities.find((a) => a.id === 'funcional')!;
    const cancelled = apply(data, {
      action: 'unenroll',
      personId: data.member.id,
      activityId: 'funcional',
      at: activity.sessions[0]!.endsAt,
    });
    expect(
      agendaItems(cancelled, data.member.id, data.referenceInstant).filter(
        (e) => e.target.id === 'funcional',
      ),
    ).toHaveLength(1);
  });
});
describe('entrenamiento de la sesión', () => {
  const start = {
    action: 'start',
    personId: 'member-demo',
    routineId: 'fuerza-semana3',
    dayId: 'A',
    id: 'w1',
    at: '2026-11-27T12:00:00-03:00',
  } as const;
  it('guarda pesos, repeticiones y series, calcula volumen y recupera el último peso', () => {
    const initial = fixture();
    let data = apply(initial, start);
    expect(previewSports(data, start)).toBeUndefined();
    expect(previewSports(data, { ...start, id: 'w2' })).toBeUndefined();
    const set = {
      action: 'set',
      personId: 'member-demo',
      id: 'w1',
      exerciseId: 'sentadilla',
      index: 0,
    } as const;
    data = apply(data, { ...set, field: 'kg', value: '102,5' });
    data = apply(data, { ...set, field: 'reps', value: '7' });
    data = apply(data, { ...set, field: 'done', value: true });
    expect(workoutMetrics(data.sports.workouts[0]!)).toMatchObject({
      done: 1,
      volume: 717.5,
    });
    expect(
      previewSports(data, { ...set, field: 'kg', value: '-2' }),
    ).toBeUndefined();
    const updated = apply(data, { ...set, field: 'kg', value: '105' });
    expect(updated.sports.workouts[0]!.exercises[0]!.sets[0]!.done).toBe(false);
    data = apply(data, {
      action: 'add-set',
      personId: 'member-demo',
      id: 'w1',
      exerciseId: 'sentadilla',
    });
    expect(workoutMetrics(data.sports.workouts[0]!).total).toBe(15);
    const finished = apply(data, {
      action: 'finish',
      personId: 'member-demo',
      id: 'w1',
      at: '2026-11-27T12:30:00-03:00',
    });
    expect(
      lastSet(
        finished,
        'member-demo',
        finished.sports.routines[0]!.days[0]!.exercises[0]!,
      ),
    ).toEqual({ kg: '102,5', reps: '7' });
    expect(
      previewSports(finished, { ...set, field: 'kg', value: '110' }),
    ).toBeUndefined();
    expect(
      previewSports(finished, {
        action: 'finish',
        personId: 'member-demo',
        id: 'w1',
        at: start.at,
      }),
    ).toBeUndefined();
    expect(agendaItems(finished, 'all', finished.referenceInstant)).toEqual(
      agendaItems(initial, 'all', initial.referenceInstant),
    );
    const next = apply(finished, { ...start, id: 'w2' });
    expect(next.sports.workouts[1]!.exercises[0]!.sets[0]!.kg).toBe('102,5');
  });
  it('impide finalizar vacío, registros inválidos y mezclar perfiles', () => {
    const data = apply(fixture(), start);
    const set = {
      action: 'set',
      personId: 'member-demo',
      id: 'w1',
      exerciseId: 'sentadilla',
      index: 0,
    } as const;
    expect(
      previewSports(data, {
        action: 'finish',
        personId: 'member-demo',
        id: 'w1',
        at: start.at,
      }),
    ).toBeUndefined();
    for (const value of ['-1', 'NaN', '1.25', '']) {
      const edited = previewSports(data, { ...set, field: 'reps', value });
      if (edited)
        expect(
          previewSports(edited, { ...set, field: 'done', value: true }),
        ).toBeUndefined();
      else expect(edited).toBeUndefined();
    }
    expect(
      previewSports(data, {
        ...set,
        personId: 'sofia-demo',
        field: 'done',
        value: true,
      }),
    ).toBeUndefined();
    expect(
      previewSports(data, { ...start, personId: 'sofia-demo', id: 'foreign' }),
    ).toBeUndefined();
    const childRoutine = {
      ...data.sports.routines[0]!,
      id: 'menores',
      personId: 'sofia-demo',
    };
    const child = apply(
      {
        ...data,
        sports: {
          ...data.sports,
          routines: [...data.sports.routines, childRoutine],
        },
      },
      { ...start, personId: 'sofia-demo', routineId: 'menores', id: 'child' },
    );
    expect(
      child.sports.workouts.filter((w) => w.personId === 'sofia-demo'),
    ).toHaveLength(1);
    expect(
      child.sports.workouts.filter((w) => w.personId === 'member-demo'),
    ).toHaveLength(1);
  });
});
describe('cierre comercial de series', () => {
  const start = {
    action: 'start',
    personId: 'member-demo',
    routineId: 'fuerza-semana3',
    dayId: 'A',
    id: 'w-demo',
    at: '2026-11-27T12:00:00-03:00',
  } as const;
  const base = () => apply(fixture(), start);
  const work = (data: MemberExperience) => data.sports.workouts[0]!;
  const series = (data: MemberExperience) => work(data).exercises[0]!.sets;
  const target = {
    personId: 'member-demo',
    id: 'w-demo',
    exerciseId: 'sentadilla',
  } as const;
  it('elimina solo una serie, ajusta el progreso y permite restaurarla una sola vez con sus valores', () => {
    let data = base();
    const prescribed = data.sports.routines;
    data = apply(data, {
      ...target,
      action: 'set',
      index: 1,
      field: 'kg',
      value: '87,5',
    });
    data = apply(data, {
      ...target,
      action: 'set',
      index: 1,
      field: 'done',
      value: true,
    });
    const original = series(data);
    data = apply(data, { ...target, action: 'remove-set', index: 1 });
    expect(series(data)).toEqual([original[0], original[2], original[3]]);
    expect(workoutMetrics(work(data))).toMatchObject({ total: 13, done: 0 });
    expect(data.sports.routines).toBe(prescribed);
    expect(work(data).exercises).toHaveLength(4);
    data = apply(data, {
      action: 'restore-set',
      personId: 'member-demo',
      id: 'w-demo',
    });
    expect(series(data)).toEqual(original);
    expect(workoutMetrics(work(data))).toMatchObject({ total: 14, done: 1 });
    expect(
      previewSports(data, {
        action: 'restore-set',
        personId: 'member-demo',
        id: 'w-demo',
      }),
    ).toBeUndefined();
  });
  it('conserva Deshacer tras agregar series y recupera un ejercicio que quedó sin series', () => {
    let data = base();
    for (let n = 0; n < 4; n++)
      data = apply(data, { ...target, action: 'remove-set', index: 0 });
    expect(series(data)).toEqual([]);
    data = apply(data, { ...target, action: 'add-set' });
    expect(series(data)).toHaveLength(1);
    data = apply(data, {
      action: 'restore-set',
      personId: 'member-demo',
      id: 'w-demo',
    });
    expect(series(data)).toHaveLength(2);
    expect(new Set(series(data).map((s) => s.id)).size).toBe(2);
  });
  it('recupera kilos al reactivar el registro y permite completar sin kilos con el interruptor apagado', () => {
    let data = base();
    data = apply(data, {
      ...target,
      action: 'set',
      index: 0,
      field: 'kg',
      value: '92,5',
    });
    const loaded = series(data)[0]!;
    data = apply(data, {
      action: 'track-weights',
      personId: 'member-demo',
      id: 'w-demo',
      value: false,
    });
    expect(series(data)[0]).toEqual(loaded);
    data = apply(data, {
      ...target,
      action: 'set',
      index: 1,
      field: 'kg',
      value: '',
    });
    data = apply(data, {
      ...target,
      action: 'set',
      index: 1,
      field: 'done',
      value: true,
    });
    expect(series(data)[1]?.done).toBe(true);
    expect(series(data)[1]?.kg).toBe('');
    data = apply(data, {
      action: 'track-weights',
      personId: 'member-demo',
      id: 'w-demo',
      value: true,
    });
    expect(series(data)[0]?.kg).toBe('92,5');
    expect(series(data)[1]?.kg).toBe('');
    expect(
      previewSports(data, {
        ...target,
        action: 'set',
        index: 1,
        field: 'done',
        value: true,
      }),
    ).toBeUndefined();
  });
  it('marca las series existentes sin inventar registros y permite desmarcar una serie', () => {
    let data = base();
    data = apply(data, {
      ...target,
      action: 'set',
      index: 0,
      field: 'kg',
      value: '',
    });
    data = apply(data, {
      ...target,
      action: 'set',
      index: 0,
      field: 'reps',
      value: '',
    });
    data = apply(data, { ...target, action: 'add-set' });
    const before = work(data).exercises;
    data = apply(data, {
      action: 'complete-all',
      personId: 'member-demo',
      id: 'w-demo',
    });
    expect(work(data).exercises).toEqual(
      before.map((e) => ({
        ...e,
        sets: e.sets.map((s) => ({ ...s, done: true })),
      })),
    );
    expect(workoutMetrics(work(data))).toMatchObject({
      total: 15,
      done: 15,
      volume: 0,
    });
    data = apply(data, {
      ...target,
      action: 'set',
      index: 1,
      field: 'done',
      value: false,
    });
    expect(workoutMetrics(work(data)).done).toBe(14);
    const completed = apply(data, {
      action: 'finish',
      personId: 'member-demo',
      id: 'w-demo',
      at: '2026-11-27T12:30:00-03:00',
    });
    expect(
      lastSet(
        completed,
        'member-demo',
        completed.sports.routines[0]!.days[0]!.exercises[0]!,
      ),
    ).toEqual({ kg: '100', reps: '6' });
  });
  it('rechaza cambios en sesiones finalizadas y de otro integrante', () => {
    const data = base();
    const intents: SportsIntent[] = [
      { ...target, action: 'add-set' },
      { ...target, action: 'remove-set', index: 0 },
      { action: 'restore-set', personId: 'member-demo', id: 'w-demo' },
      {
        action: 'track-weights',
        personId: 'member-demo',
        id: 'w-demo',
        value: false,
      },
      { action: 'complete-all', personId: 'member-demo', id: 'w-demo' },
    ];
    const complete = apply(data, {
      action: 'complete-all',
      personId: 'member-demo',
      id: 'w-demo',
    });
    const finished = apply(complete, {
      action: 'finish',
      personId: 'member-demo',
      id: 'w-demo',
      at: start.at,
    });
    for (const intent of intents) {
      expect(
        previewSports(data, { ...intent, personId: 'sofia-demo' }),
      ).toBeUndefined();
      expect(previewSports(finished, intent)).toBeUndefined();
    }
  });
});
it('recupera un peso explícito sin inventar repeticiones en el historial al completar todas', () => {
  const seed = fixture(),
    personId = seed.member.id;
  let data = apply(seed, {
    action: 'start',
    personId,
    id: 'recorded',
    routineId: 'fuerza-semana3',
    dayId: 'A',
    at: seed.referenceInstant,
  });
  data = apply(data, {
    action: 'set',
    personId,
    id: 'recorded',
    exerciseId: 'sentadilla',
    index: 0,
    field: 'kg',
    value: '92,5',
  });
  data = apply(data, { action: 'complete-all', personId, id: 'recorded' });
  data = apply(data, {
    action: 'finish',
    personId,
    id: 'recorded',
    at: seed.referenceInstant,
  });
  const exercise = data.sports.routines[0]!.days[0]!.exercises[0]!;
  expect(lastSet(data, personId, exercise)).toEqual({ kg: '92,5', reps: '' });
  data = apply(data, {
    action: 'start',
    personId,
    id: 'next',
    routineId: 'fuerza-semana3',
    dayId: 'A',
    at: seed.referenceInstant,
  });
  const next = data.sports.workouts[1]!.exercises[0]!.sets[0]!;
  expect(next).toMatchObject({
    kg: '92,5',
    reps: '6',
    done: false,
    kgRecorded: false,
    repsRecorded: false,
  });
});
