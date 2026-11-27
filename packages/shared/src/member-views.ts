import { activityClasses } from './sports';
import {
  selectPersonalEvents,
  type MemberExperience,
  type FamilyScope,
  type MemberIdentity,
  type PersonalEvent,
} from './member-experience';
/** Presentation scopes supplied by this demo snapshot. Real authorization belongs to the backend. */
export function viewablePeople(
  data: MemberExperience,
  scope: FamilyScope,
): MemberIdentity[] {
  return [
    data.member,
    ...data.family.filter((person) => person.scopes.includes(scope)),
  ];
}
export type AgendaItem = PersonalEvent & { personId: string };
export function agendaItems(
  data: MemberExperience,
  filter: string,
  from: string,
): AgendaItem[] {
  const members = viewablePeople(data, 'agenda');
  return members
    .filter((p) => filter === 'all' || filter === p.id)
    .flatMap((person) => {
      const events =
        person.id === data.member.id
          ? selectPersonalEvents(data, from, { pendingQuinchos: true })
          : [
              ...(data.family.find((f) => f.id === person.id)?.events ?? []),
              ...activityClasses(data, person.id),
            ];
      return events
        .filter((e) => Date.parse(e.endsAt) > Date.parse(from))
        .map((e) => ({ ...e, personId: person.id }));
    })
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}
export function visibleScholarships(data: MemberExperience) {
  const people = viewablePeople(data, 'fees');
  return data.account.scholarships.flatMap((s) => {
    const person = people.find((p) => p.id === s.memberId);
    return person ? [{ ...s, person }] : [];
  });
}
