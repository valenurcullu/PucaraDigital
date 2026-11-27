import type {
  ActivitySession,
  MemberExperience,
  PersonalEvent,
} from './member-experience';
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  previousKg: number;
}
export interface Routine {
  id: string;
  personId: string;
  title: string;
  coach: string;
  frequency: string;
  days: readonly { id: string; name: string; exercises: readonly Exercise[] }[];
}
export interface SetRecord {
  id?: string;
  kgRecorded?: boolean;
  repsRecorded?: boolean;
  kg: string;
  reps: string;
  done: boolean;
}
export interface Workout {
  id: string;
  personId: string;
  routineId: string;
  dayId: string;
  startedAt: string;
  finishedAt?: string;
  trackWeights?: boolean;
  nextSetId?: number;
  removedSet?:
    { exerciseId: string; index: number; set: SetRecord } | undefined;
  exercises: readonly { id: string; sets: readonly SetRecord[] }[];
}
export interface Enrollment {
  personId: string;
  activityId: 'yoga' | 'funcional';
  active: boolean;
  classes: readonly ActivitySession[];
}
export interface SportsState {
  routines: readonly Routine[];
  workouts: readonly Workout[];
  enrollments: readonly Enrollment[];
}
export type SportsIntent =
  | {
      action: 'enroll';
      personId: string;
      activityId: 'yoga' | 'funcional';
      at: string;
    }
  | {
      action: 'unenroll';
      personId: string;
      activityId: 'yoga' | 'funcional';
      at: string;
    }
  | {
      action: 'start';
      personId: string;
      routineId: string;
      dayId: string;
      id: string;
      at: string;
    }
  | {
      action: 'set';
      personId: string;
      id: string;
      exerciseId: string;
      index: number;
      field: 'kg' | 'reps' | 'done';
      value: string | boolean;
    }
  | { action: 'add-set'; personId: string; id: string; exerciseId: string }
  | {
      action: 'remove-set';
      personId: string;
      id: string;
      exerciseId: string;
      index: number;
    }
  | { action: 'restore-set'; personId: string; id: string }
  | { action: 'track-weights'; personId: string; id: string; value: boolean }
  | { action: 'complete-all'; personId: string; id: string }
  | { action: 'finish'; personId: string; id: string; at: string };
export function sportsPersonAllowed(data: MemberExperience, personId: string) {
  return (
    personId === data.member.id ||
    data.family.some(
      (p) => p.id === personId && p.scopes.includes('activities'),
    )
  );
}
export function activityClasses(
  data: MemberExperience,
  personId: string,
): PersonalEvent[] {
  return data.activities.flatMap((a) => {
    const membership = data.sports.enrollments.find(
      (e) => e.personId === personId && e.activityId === a.id,
    );
    const sessions = membership
      ? membership.classes
      : personId === a.participantId && a.enrollment === 'active'
        ? a.sessions
        : [];
    return sessions.map((s) => ({
      id: a.id + '-' + s.id,
      kind: 'activity' as const,
      status: 'enrolled' as const,
      title: a.title,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      location: a.location,
      target: { kind: 'module' as const, id: a.id },
    }));
  });
}
export function numberValue(value: string) {
  if (!/^\d+(?:[.,]\d{0,2})?$/.test(value)) return;
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}
export function workoutMetrics(workout: Workout) {
  const sets = workout.exercises.flatMap((e) => e.sets),
    done = sets.filter((s) => s.done);
  return {
    total: sets.length,
    done: done.length,
    volume: done.reduce(
      (sum, s) =>
        sum +
        (s.kgRecorded === false || s.repsRecorded === false
          ? 0
          : (numberValue(s.kg) ?? 0) * (numberValue(s.reps) ?? 0)),
      0,
    ),
  };
}
export function lastSet(
  data: MemberExperience,
  personId: string,
  exercise: Exercise,
): { kg: string; reps: string } {
  const record = data.sports.workouts
    .filter((w) => w.personId === personId && w.finishedAt)
    .slice()
    .sort((a, b) => Date.parse(b.finishedAt!) - Date.parse(a.finishedAt!))
    .flatMap((w) =>
      w.exercises
        .filter((e) => e.id === exercise.id)
        .flatMap((e) =>
          e.sets
            .filter(
              (s) =>
                s.done &&
                s.kgRecorded !== false &&
                numberValue(s.kg) !== undefined,
            )
            .slice()
            .reverse(),
        ),
    )[0];
  return record
    ? { kg: record.kg, reps: record.repsRecorded === false ? '' : record.reps }
    : { kg: String(exercise.previousKg), reps: String(exercise.reps) };
}
export function previewSports(
  data: MemberExperience,
  intent: SportsIntent,
): MemberExperience | undefined {
  if (!sportsPersonAllowed(data, intent.personId)) return;
  const sports = data.sports;
  if (intent.action === 'enroll' || intent.action === 'unenroll') {
    const a = data.activities.find((a) => a.id === intent.activityId);
    if (!a || !Number.isFinite(Date.parse(intent.at))) return;
    const old = sports.enrollments.find(
      (e) => e.personId === intent.personId && e.activityId === a.id,
    );
    const active =
      old?.active ??
      (a.participantId === intent.personId && a.enrollment === 'active');
    const join = intent.action === 'enroll';
    if (active === join || (join && a.availablePlaces < 1)) return;
    const classes = join
      ? [
          ...(old?.classes ?? []),
          ...a.sessions.filter(
            (s) =>
              Date.parse(s.startsAt) > Date.parse(intent.at) &&
              !old?.classes.some((c) => c.id === s.id),
          ),
        ]
      : (old?.classes ?? a.sessions).filter(
          (s) => Date.parse(s.startsAt) <= Date.parse(intent.at),
        );
    const enrollment: Enrollment = {
      personId: intent.personId,
      activityId: a.id,
      active: join,
      classes,
    };
    return {
      ...data,
      activities: data.activities.map((item) =>
        item === a
          ? {
              ...item,
              availablePlaces: item.availablePlaces + (join ? -1 : 1),
              ...(intent.personId === data.member.id
                ? { enrollment: join ? ('active' as const) : ('none' as const) }
                : {}),
            }
          : item,
      ),
      sports: {
        ...sports,
        enrollments: [
          ...sports.enrollments.filter((e) => e !== old),
          enrollment,
        ],
      },
    };
  }
  if (intent.action === 'start') {
    const routine = sports.routines.find(
        (r) => r.id === intent.routineId && r.personId === intent.personId,
      ),
      day = routine?.days.find((d) => d.id === intent.dayId);
    if (
      !day ||
      sports.workouts.some(
        (w) =>
          w.id === intent.id ||
          (w.personId === intent.personId && !w.finishedAt),
      ) ||
      !Number.isFinite(Date.parse(intent.at))
    )
      return;
    const workout: Workout = {
      id: intent.id,
      personId: intent.personId,
      routineId: intent.routineId,
      dayId: intent.dayId,
      startedAt: intent.at,
      trackWeights: true,
      nextSetId: 1,
      exercises: day.exercises.map((e) => ({
        id: e.id,
        sets: Array.from({ length: e.sets }, (_, index) => ({
          id: e.id + '-prescribed-' + index,
          kgRecorded: false,
          repsRecorded: false,
          kg: lastSet(data, intent.personId, e).kg,
          reps: lastSet(data, intent.personId, e).reps || String(e.reps),
          done: false,
        })),
      })),
    };
    return {
      ...data,
      sports: { ...sports, workouts: [...sports.workouts, workout] },
    };
  }
  const old = sports.workouts.find(
    (w) =>
      w.id === intent.id && w.personId === intent.personId && !w.finishedAt,
  );
  if (!old) return;
  let updated: Workout;
  if (intent.action === 'track-weights')
    updated = { ...old, trackWeights: intent.value };
  else if (intent.action === 'complete-all') {
    if (!workoutMetrics(old).total) return;
    updated = {
      ...old,
      exercises: old.exercises.map((e) => ({
        ...e,
        sets: e.sets.map((set) => ({ ...set, done: true })),
      })),
    };
  } else if (intent.action === 'restore-set') {
    const removed = old.removedSet;
    if (!removed) return;
    const exercise = old.exercises.find((e) => e.id === removed.exerciseId);
    if (
      !exercise ||
      (removed.set.id && exercise.sets.some((s) => s.id === removed.set.id))
    )
      return;
    const sets = [...exercise.sets];
    sets.splice(Math.min(removed.index, sets.length), 0, removed.set);
    updated = {
      ...old,
      removedSet: undefined,
      exercises: old.exercises.map((e) =>
        e === exercise ? { ...e, sets } : e,
      ),
    };
  } else if (intent.action === 'finish') {
    if (
      !workoutMetrics(old).done ||
      !Number.isFinite(Date.parse(intent.at)) ||
      Date.parse(intent.at) < Date.parse(old.startedAt)
    )
      return;
    updated = { ...old, finishedAt: intent.at };
  } else {
    const exercise = old.exercises.find((e) => e.id === intent.exerciseId);
    if (!exercise) return;
    let sets: readonly SetRecord[];
    if (intent.action === 'remove-set') {
      const removed = exercise.sets[intent.index];
      if (!removed) return;
      return {
        ...data,
        sports: {
          ...sports,
          workouts: sports.workouts.map((w) =>
            w === old
              ? {
                  ...old,
                  removedSet: {
                    exerciseId: exercise.id,
                    index: intent.index,
                    set: removed,
                  },
                  exercises: old.exercises.map((e) =>
                    e === exercise
                      ? {
                          ...e,
                          sets: e.sets.filter((_, i) => i !== intent.index),
                        }
                      : e,
                  ),
                }
              : w,
          ),
        },
      };
    } else if (intent.action === 'add-set') {
      const prescribed = sports.routines
        .find((r) => r.id === old.routineId && r.personId === old.personId)
        ?.days.find((d) => d.id === old.dayId)
        ?.exercises.find((e) => e.id === exercise.id);
      const previous =
        exercise.sets.at(-1) ??
        (prescribed ? lastSet(data, old.personId, prescribed) : undefined);
      if (!previous) return;
      sets = [
        ...exercise.sets,
        {
          kg: previous.kg,
          reps: previous.reps,
          done: false,
          id: 'added-' + (old.nextSetId ?? 1),
          kgRecorded: false,
          repsRecorded: false,
        },
      ];
    } else {
      const set = exercise.sets[intent.index];
      if (!set) return;
      const value = intent.value;
      if (intent.field === 'done') {
        if (
          typeof value !== 'boolean' ||
          (value &&
            ((old.trackWeights !== false &&
              numberValue(set.kg) === undefined) ||
              !/^\d+$/.test(set.reps) ||
              Number(set.reps) < 1))
        )
          return;
      } else if (
        typeof value !== 'string' ||
        (value !== '' &&
          (numberValue(value) === undefined ||
            (intent.field === 'reps' && !/^\d+$/.test(value))))
      )
        return;
      sets = exercise.sets.map((s, i) =>
        i === intent.index
          ? {
              ...s,
              [intent.field]: value,
              ...(intent.field === 'done'
                ? value
                  ? {
                      repsRecorded: true,
                      kgRecorded:
                        old.trackWeights !== false
                          ? true
                          : (s.kgRecorded ?? false),
                    }
                  : {}
                : {
                    done: false,
                    [intent.field === 'kg' ? 'kgRecorded' : 'repsRecorded']:
                      true,
                  }),
            }
          : s,
      );
    }
    updated = {
      ...old,
      ...(intent.action === 'add-set'
        ? { nextSetId: (old.nextSetId ?? 1) + 1 }
        : {}),
      exercises: old.exercises.map((e) =>
        e === exercise ? { ...e, sets } : e,
      ),
    };
  }
  return {
    ...data,
    sports: {
      ...sports,
      workouts: sports.workouts.map((w) => (w === old ? updated : w)),
    },
  };
}
