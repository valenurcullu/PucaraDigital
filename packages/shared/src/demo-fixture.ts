import type { ClubMatch } from './member-experience';
import type { FixtureCatalog, SportId } from './fixture';
import { offsetClubDay } from './padel-availability';
/** Entire catalogue is fictitious and configurable. Venues belong to each match. */
export function createDemoFixture(day: string): {
  fixture: FixtureCatalog;
  matches: readonly ClubMatch[];
} {
  const groups: FixtureCatalog['groups'] = [
    {
      id: 'rugby-superior',
      sport: 'rugby',
      title: 'Plantel Superior',
      scorePolicy: 'competitive',
    },
    {
      id: 'rugby-juveniles',
      sport: 'rugby',
      title: 'Juveniles',
      scorePolicy: 'competitive',
    },
    {
      id: 'rugby-infantiles',
      sport: 'rugby',
      title: 'Infantiles',
      scorePolicy: 'encounters',
    },
    {
      id: 'hockey-lineas',
      sport: 'hockey',
      title: 'Por línea',
      scorePolicy: 'competitive',
    },
    {
      id: 'hockey-otras',
      sport: 'hockey',
      title: 'Otras categorías',
      scorePolicy: 'competitive',
    },
  ];
  const lines = ['A', 'B', 'C', 'D'].map((letter) => ({
    id: 'hockey-' + letter,
    groupId: 'hockey-lineas',
    title: 'Línea ' + letter,
  }));
  const divisions: FixtureCatalog['divisions'][number][] = [];
  const add = (
    sport: SportId,
    groupId: string,
    titles: readonly string[],
    lineId?: string,
  ) =>
    titles.forEach((title, index) =>
      divisions.push({
        id: (lineId ?? groupId) + '-' + index,
        sport,
        groupId,
        title,
        ...(lineId ? { lineId } : {}),
      }),
    );
  add('rugby', 'rugby-superior', [
    'Primera',
    'Intermedia',
    'Pre A',
    'Pre B',
    'Pre C',
    'Pre D',
    'Pre E',
  ]);
  add('rugby', 'rugby-juveniles', ['M15', 'M16', 'M17', 'M18', 'M19']);
  add('rugby', 'rugby-infantiles', [
    'Preescuelita',
    'M6',
    'M7',
    'M8',
    'M9',
    'M10',
    'M11',
    'M12',
    'M13',
    'M14',
    'Puca Mix',
  ]);
  lines.forEach((line) =>
    add(
      'hockey',
      'hockey-lineas',
      line.id === 'hockey-D'
        ? ['Primera', 'Intermedia', 'Quinta', 'Sexta', 'Séptima']
        : line.id === 'hockey-C'
          ? ['Primera', 'Intermedia', 'Quinta', 'Sexta', 'Séptima', 'Octava']
          : [
              'Primera',
              'Intermedia',
              'Quinta',
              'Sexta',
              'Séptima',
              'Octava',
              'Novena',
            ],
      line.id,
    ),
  );
  add('hockey', 'hockey-otras', ['Cuarta', 'Décima', 'Escuelita']);
  const venues = [
    {
      id: 'pucara',
      title: 'Club Pucará',
      address: 'Cancha principal · sede de ejemplo',
    },
    {
      id: 'sintetica',
      title: 'Club Pucará · Cancha sintética',
      address: 'Sede de ejemplo',
    },
    {
      id: 'parque',
      title: 'Club del Parque',
      address: 'Sede visitante de ejemplo',
    },
    {
      id: 'norte',
      title: 'Club del Norte',
      address: 'Predio norte · sede de ejemplo',
    },
    {
      id: 'oeste',
      title: 'Club del Oeste',
      address: 'Predio oeste · sede de ejemplo',
    },
  ];
  const teams: NonNullable<FixtureCatalog['teams']>[number][] = [];
  for (const division of divisions) {
    const labels =
      division.groupId === 'rugby-juveniles'
        ? division.title === 'M17'
          ? ['A', 'B', 'C']
          : division.title === 'M18'
            ? ['A']
            : ['A', 'B']
        : [''];
    labels.forEach((label) =>
      teams.push({
        id: division.id + (label ? '-' + label : ''),
        divisionId: division.id,
        title: division.title + (label ? ' ' + label : ''),
      }),
    );
  }
  const matches: ClubMatch[] = [],
    rounds: FixtureCatalog['rounds'][number][] = [],
    results: FixtureCatalog['results'][number][] = [];
  const scopes = groups.flatMap<{
    group: FixtureCatalog['groups'][number];
    line: FixtureCatalog['lines'][number] | undefined;
  }>((group) => {
    const groupLines = lines.filter((l) => l.groupId === group.id);
    return groupLines.length
      ? groupLines.map((line) => ({ group, line }))
      : [{ group, line: undefined }];
  });
  const superiorTimes = [
    '15:30',
    '13:45',
    '12:00',
    '13:45',
    '10:00',
    '12:00',
    '11:00',
  ];
  const hockeyTimes = [
    '16:00',
    '14:30',
    '13:00',
    '11:30',
    '10:00',
    '09:00',
    '08:00',
  ];
  for (const { group, line } of scopes) {
    const scopedDivisions = divisions.filter(
      (d) => d.groupId === group.id && d.lineId === line?.id,
    );
    const ids = new Set(scopedDivisions.map((d) => d.id));
    const entries = teams.filter((t) => ids.has(t.divisionId));
    const infant = group.scorePolicy === 'encounters';
    const baseOffset =
      group.sport === 'rugby' ? 2 : line?.id === 'hockey-B' ? 1 : 3;
    for (const occurrence of [-2, -1, 0, 1, 2]) {
      if (infant && occurrence < 0) continue;
      const date = offsetClubDay(day, baseOffset + occurrence * 7),
        roundId = (line?.id ?? group.id) + '-round-' + occurrence;
      rounds.push({
        id: roundId,
        sport: group.sport,
        groupId: group.id,
        title: (infant ? 'Encuentro ' : 'Jornada ') + (8 + occurrence),
        on: date,
        ...(line ? { lineId: line.id } : {}),
      });
      // The last upcoming round deliberately has no published programme.
      if (occurrence === 2) continue;
      entries.forEach((team, index) => {
        const division = scopedDivisions.find((d) => d.id === team.divisionId)!;
        const divisionIndex = scopedDivisions.indexOf(division);
        const multiDay =
          (group.id === 'rugby-juveniles' &&
            (team.title.endsWith(' C') || team.title === 'M19 B')) ||
          (group.id === 'rugby-infantiles' && division.title === 'Puca Mix') ||
          (group.id === 'hockey-otras' && division.title === 'Escuelita');
        const on = offsetClubDay(date, multiDay ? 1 : 0);
        const venueId =
          group.id === 'rugby-superior'
            ? divisionIndex < 4
              ? 'pucara'
              : 'norte'
            : group.sport === 'rugby'
              ? ['pucara', 'norte', 'oeste'][index % 3]!
              : line?.id === 'hockey-A'
                ? 'parque'
                : line?.id === 'hockey-B'
                  ? 'sintetica'
                  : line?.id === 'hockey-C'
                    ? 'norte'
                    : line?.id === 'hockey-D' && division.title !== 'Séptima'
                      ? 'oeste'
                      : division.title === 'Cuarta'
                        ? 'pucara'
                        : 'parque';
        const venue = venues.find((v) => v.id === venueId)!;
        const opponent =
          group.id === 'rugby-superior'
            ? divisionIndex < 4
              ? 'Club del Sur'
              : 'Club del Norte'
            : group.sport === 'rugby'
              ? ['Club del Sur', 'Club del Norte', 'Club del Oeste'][index % 3]!
              : line?.id === 'hockey-A'
                ? 'Club del Parque'
                : line?.id === 'hockey-B'
                  ? 'Club del Norte'
                  : line?.id === 'hockey-C'
                    ? 'Club del Oeste'
                    : division.title === 'Séptima'
                      ? 'Club del Parque'
                      : 'Club del Oeste';
        const time =
          group.id === 'rugby-superior'
            ? superiorTimes[divisionIndex]!
            : group.id === 'rugby-juveniles'
              ? ['09:00', '10:15', '11:30', '12:45'][index % 4]!
              : group.id === 'rugby-infantiles'
                ? index % 2
                  ? '10:30'
                  : '10:00'
                : (hockeyTimes[divisionIndex] ?? '09:00');
        const firstId =
          division.id === 'rugby-superior-0'
            ? 'rugby-primera'
            : division.id === 'hockey-A-0'
              ? 'hockey-primera'
              : team.id;
        const match: ClubMatch = {
          id: occurrence === 0 ? firstId : firstId + '-round-' + occurrence,
          sport: group.sport,
          division: division.title,
          divisionId: division.id,
          teamId: team.id,
          roundId,
          venueId,
          opponent,
          venue:
            venueId === 'pucara' || venueId === 'sintetica' ? 'home' : 'away',
          startsAt: on + 'T' + time + ':00-03:00',
          location: venue.title + ' · ' + venue.address,
          status: occurrence < 0 ? 'played' : 'scheduled',
        };
        matches.push(match);
        if (occurrence < 0 && !infant)
          results.push({
            matchId: match.id,
            home: group.sport === 'rugby' ? 27 + index : 3,
            away: group.sport === 'rugby' ? 18 + index : 1 + (index % 2),
          });
      });
    }
  }
  return {
    fixture: {
      sports: [
        { id: 'rugby', title: 'Rugby', featuredDivisionId: 'rugby-superior-0' },
        { id: 'hockey', title: 'Hockey', featuredDivisionId: 'hockey-A-0' },
      ],
      groups,
      teams,
      lines,
      divisions,
      rounds,
      venues,
      results,
    },
    matches,
  };
}
