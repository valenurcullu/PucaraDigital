import { activityClasses, type SportsState } from './sports';
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
  readonly demoPayment?: 'credit' | 'pay';
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
  readonly kind: 'reservation' | 'activity' | 'training' | 'callup';
  readonly status?: AgendaStatus;
  readonly title: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly location: string;
  readonly target: ExperienceTarget;
}
export type AgendaStatus =
  'confirmed' | 'pending' | 'enrolled' | 'training' | 'called' | 'cancelled';
export interface MemberIdentity {
  readonly id: string;
  readonly name: string;
  readonly firstName: string;
  readonly number: string;
  readonly administrativeStatus: string;
  readonly category: string;
  readonly card: {
    enabled: boolean;
    validThrough: string;
    sample: 'A' | 'B' | 'C';
  };
}
export type FamilyScope =
  'profile' | 'card' | 'agenda' | 'fees' | 'activities' | 'reservations';
export interface FamilyMember extends MemberIdentity {
  readonly relationship: string;
  readonly age: number;
  readonly scopes: readonly FamilyScope[];
  readonly otherGuardians: readonly string[];
  readonly events: readonly PersonalEvent[];
}
export interface MemberExperience {
  readonly mode: 'demo';
  readonly sports: SportsState;
  readonly referenceInstant: string;
  readonly member: MemberIdentity;
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
    readonly scholarships: readonly {
      memberId: string;
      name: string;
      percentage: number;
    }[];
    readonly dues: readonly {
      period: string;
      amountMinor: number;
      dueOn: string;
      payment?: { date: string; method: string };
    }[];
    readonly amountDueMinor: number;
    readonly currency: 'ARS';
  };
  readonly family: readonly FamilyMember[];
}
export interface MemberExperienceReader {
  read(signal: { readonly aborted: boolean }): Promise<MemberExperience>;
}

/** Read model only. It grants no permission and performs no reservation mutations. */
export function selectPersonalEvents(
  data: MemberExperience,
  at = data.referenceInstant,
  { pendingQuinchos = false }: { pendingQuinchos?: boolean } = {},
): PersonalEvent[] {
  const reservations: PersonalEvent[] = data.reservations
    .filter(
      (r) =>
        r.status === 'confirmed' ||
        (pendingQuinchos && r.resource === 'quincho' && r.status === 'pending'),
    )
    .map((r) => ({
      id: 'reservation-' + r.id,
      kind: 'reservation',
      status: r.status,
      title: r.title,
      startsAt: r.startsAt,
      endsAt: r.endsAt,
      location: r.location,
      target: { kind: 'reservation', id: r.id },
    }));
  const classes = activityClasses(data, data.member.id);
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
const clubDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: clubTimeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
export function clubDay(date: Date): string {
  const parts = clubDateFormatter.formatToParts(date);
  return ['year', 'month', 'day']
    .map((key) => parts.find((p) => p.type === key)?.value)
    .join('-');
}
