export type ModuleId =
  | 'reservas'
  | 'padel'
  | 'quinchos'
  | 'rugby'
  | 'hockey'
  | 'gimnasio'
  | 'yoga'
  | 'funcional'
  | 'buffet'
  | 'beneficios'
  | 'novedades'
  | 'eventos'
  | 'cuenta-corriente'
  | 'familia'
  | 'perfil'
  | 'preferencias'
  | 'soporte';
export interface ClubModule {
  readonly id: ModuleId;
  readonly title: string;
  readonly summary: string;
}
export interface ClubGroup {
  readonly title: string;
  readonly modules: readonly ModuleId[];
}
export type ExperienceTarget =
  | { readonly kind: 'module'; readonly id: ModuleId }
  | { readonly kind: 'match' | 'notice' | 'reservation'; readonly id: string };
export interface ClubMatch {
  readonly id: string;
  readonly sport: 'rugby' | 'hockey';
  readonly division: string;
  readonly opponent: string;
  readonly venue: 'home' | 'away';
  readonly startsAt: string;
  readonly location: string;
}
export interface ClubNotice {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly summary: string;
  readonly body: string;
}
export interface MemberReservation {
  readonly id: string;
  readonly resource: 'padel' | 'quincho';
  readonly title: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly location: string;
  readonly status: 'confirmed' | 'pending' | 'cancelled';
}
export interface ActivitySession {
  readonly id: string;
  readonly startsAt: string;
  readonly endsAt: string;
}
export interface MemberActivity {
  readonly id: 'yoga' | 'funcional';
  readonly title: string;
  readonly description: string;
  readonly schedule: string;
  readonly location: string;
  readonly availablePlaces: number;
  readonly enrollment: 'active' | 'none';
  readonly participantId: string;
  readonly sessions: readonly ActivitySession[];
}
export interface PersonalEvent {
  readonly id: string;
  readonly kind: 'reservation' | 'activity' | 'training';
  readonly title: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly location: string;
  readonly target: ExperienceTarget;
}
export interface MemberExperience {
  readonly mode: 'demo';
  readonly referenceInstant: string;
  readonly member: {
    readonly id: string;
    readonly name: string;
    readonly firstName: string;
    readonly number: string;
    readonly administrativeStatus: string;
  };
  readonly modules: readonly ClubModule[];
  readonly groups: readonly ClubGroup[];
  readonly matches: readonly ClubMatch[];
  readonly notices: readonly ClubNotice[];
  readonly reservations: readonly MemberReservation[];
  readonly activities: readonly MemberActivity[];
  readonly scheduledEvents: readonly PersonalEvent[];
  readonly padel: {
    readonly durationMinutes: 90;
    readonly priceMinor: number;
    readonly currency: 'ARS';
    readonly availableCredits: number;
  };
  readonly account: {
    readonly status: string;
    readonly scholarship: string;
    readonly amountDueMinor: number;
    readonly currency: 'ARS';
  };
  readonly family: readonly {
    readonly id: string;
    readonly name: string;
    readonly relationship: string;
    readonly authorization: string;
  }[];
}
export interface MemberExperienceReader {
  read(signal: { readonly aborted: boolean }): Promise<MemberExperience>;
}

/** Read model only. It grants no permission and performs no reservation mutations. */
export function selectPersonalEvents(
  data: MemberExperience,
  at = data.referenceInstant,
): PersonalEvent[] {
  const reservations: PersonalEvent[] = data.reservations
    .filter((r) => r.status === 'confirmed')
    .map((r) => ({
      id: 'reservation-' + r.id,
      kind: 'reservation',
      title: r.title,
      startsAt: r.startsAt,
      endsAt: r.endsAt,
      location: r.location,
      target: { kind: 'reservation', id: r.id },
    }));
  const classes: PersonalEvent[] = data.activities
    .filter(
      (a) => a.enrollment === 'active' && a.participantId === data.member.id,
    )
    .flatMap((a) =>
      a.sessions.map((s) => ({
        id: a.id + '-' + s.id,
        kind: 'activity' as const,
        title: a.title,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        location: a.location,
        target: { kind: 'module' as const, id: a.id },
      })),
    );
  return [...reservations, ...classes, ...data.scheduledEvents]
    .filter((e) => Date.parse(e.endsAt) > Date.parse(at))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}
export function selectFirstTeamMatches(data: MemberExperience): ClubMatch[] {
  return (['rugby', 'hockey'] as const).flatMap((sport) => {
    const next = data.matches
      .filter(
        (m) =>
          m.sport === sport &&
          m.division === 'Primera' &&
          Date.parse(m.startsAt) >= Date.parse(data.referenceInstant),
      )
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0];
    return next ? [next] : [];
  });
}
export const clubTimeZone = 'America/Argentina/Buenos_Aires';
export function clubDay(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: clubTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  return ['year', 'month', 'day']
    .map((key) => parts.find((p) => p.type === key)?.value)
    .join('-');
}
