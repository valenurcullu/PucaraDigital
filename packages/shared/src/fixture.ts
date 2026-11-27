import type { ClubMatch, MemberExperience } from './member-experience';
export type SportId = 'rugby' | 'hockey';
export interface FixtureCatalog {
  readonly sports: readonly {
    id: SportId;
    title: string;
    featuredDivisionId: string;
  }[];
  readonly groups: readonly {
    id: string;
    sport: SportId;
    title: string;
    scorePolicy: 'competitive' | 'encounters';
  }[];
  readonly lines: readonly { id: string; groupId: string; title: string }[];
  readonly divisions: readonly {
    id: string;
    sport: SportId;
    groupId: string;
    lineId?: string;
    title: string;
  }[];
  readonly rounds: readonly {
    id: string;
    sport: SportId;
    lineId?: string;
    title: string;
    on: string;
  }[];
  readonly venues: readonly { id: string; title: string; address: string }[];
  readonly results: readonly { matchId: string; home: number; away: number }[];
}
export interface FixtureFilter {
  sport?: string | undefined;
  group?: string | undefined;
  line?: string | undefined;
  division?: string | undefined;
}
export function resolveFixture(
  catalog: FixtureCatalog,
  filter: FixtureFilter = {},
) {
  const sport =
    catalog.sports.find((s) => s.id === filter.sport) ?? catalog.sports[0];
  if (!sport) return;
  const groups = catalog.groups.filter((g) => g.sport === sport.id);
  const requested = catalog.divisions.find(
    (d) => d.id === filter.division && d.sport === sport.id,
  );
  const group =
    groups.find((g) => g.id === filter.group) ??
    groups.find((g) => g.id === requested?.groupId) ??
    groups[0];
  if (!group) return;
  const lines = catalog.lines.filter((l) => l.groupId === group.id);
  const line =
    lines.find((l) => l.id === filter.line) ??
    lines.find((l) => l.id === requested?.lineId) ??
    lines[0];
  const divisions = catalog.divisions.filter(
    (d) =>
      d.sport === sport.id && d.groupId === group.id && d.lineId === line?.id,
  );
  const division =
    divisions.find((d) => d.id === filter.division) ?? divisions[0];
  return { sport, groups, group, lines, line, divisions, division };
}
export function fixturesForDivision(
  data: MemberExperience,
  divisionId: string,
) {
  const rows = data.matches
    .filter((m) => m.divisionId === divisionId)
    .slice()
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  return {
    upcoming: rows.filter(
      (m) =>
        m.status === 'scheduled' &&
        Date.parse(m.startsAt) >= Date.parse(data.referenceInstant),
    ),
    previous: rows
      .filter(
        (m) =>
          m.status === 'played' &&
          Date.parse(m.startsAt) < Date.parse(data.referenceInstant),
      )
      .reverse(),
  };
}
export function fixtureResult(data: MemberExperience, match: ClubMatch) {
  const division = data.fixture.divisions.find(
    (d) => d.id === match.divisionId,
  );
  const group = data.fixture.groups.find((g) => g.id === division?.groupId);
  if (group?.scorePolicy !== 'competitive' || match.status !== 'played') return;
  const score = data.fixture.results.find((r) => r.matchId === match.id);
  if (!score) return;
  const pucara = match.venue === 'home' ? score.home : score.away,
    opponent = match.venue === 'home' ? score.away : score.home;
  return {
    pucara,
    opponent,
    outcome: pucara === opponent ? 'E' : pucara > opponent ? 'G' : 'P',
  } as const;
}
export function hockeyRound(data: MemberExperience, match: ClubMatch) {
  const division = data.fixture.divisions.find(
    (d) => d.id === match.divisionId,
  );
  if (match.sport !== 'hockey' || !division?.lineId) return [];
  const ids = new Set(
    data.fixture.divisions
      .filter((d) => d.lineId === division.lineId && d.sport === 'hockey')
      .map((d) => d.id),
  );
  return data.matches
    .filter(
      (m) =>
        m.sport === 'hockey' &&
        m.roundId === match.roundId &&
        ids.has(m.divisionId),
    )
    .slice()
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}
export function featuredMatches(data: MemberExperience): ClubMatch[] {
  return data.fixture.sports.flatMap((sport) => {
    const next = fixturesForDivision(data, sport.featuredDivisionId)
      .upcoming[0];
    return next ? [next] : [];
  });
}
