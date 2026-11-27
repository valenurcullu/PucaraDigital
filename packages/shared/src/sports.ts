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
  progress: readonly number[];
}
export interface SetRecord {
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
      (sum, s) => sum + (numberValue(s.kg) ?? 0) * (numberValue(s.reps) ?? 0),
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
            .filter((s) => s.done)
            .slice()
            .reverse(),
        ),
    )[0];
  return record
    ? { kg: record.kg, reps: record.reps }
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
      exercises: day.exercises.map((e) => ({
        id: e.id,
        sets: Array.from({ length: e.sets }, () => ({
          ...lastSet(data, intent.personId, e),
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
  if (intent.action === 'finish') {
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
    if (intent.action === 'add-set') {
      const last = exercise.sets.at(-1);
      if (!last) return;
      sets = [...exercise.sets, { ...last, done: false }];
    } else {
      const set = exercise.sets[intent.index];
      if (!set) return;
      const value = intent.value;
      if (intent.field === 'done') {
        if (
          typeof value !== 'boolean' ||
          (value &&
            (numberValue(set.kg) === undefined ||
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
              ...(intent.field !== 'done' ? { done: false } : {}),
            }
          : s,
      );
    }
    updated = {
      ...old,
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
