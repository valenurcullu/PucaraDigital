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
      [
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
  const matches: ClubMatch[] = [],
    rounds: FixtureCatalog['rounds'][number][] = [],
    results: FixtureCatalog['results'][number][] = [];
  divisions.forEach((d, index) => {
    // Some divisions intentionally have no published examples.
    if (
      d.title === 'Pre E' ||
      d.title === 'Puca Mix' ||
      d.lineId === 'hockey-C' ||
      d.title === 'Escuelita'
    )
      return;
    const infant = d.groupId === 'rugby-infantiles';
    const hockeyLine = d.lineId
      ? lines.findIndex((l) => l.id === d.lineId)
      : -1;
    const baseOffset =
      d.sport === 'rugby' ? 2 : d.lineId === 'hockey-B' ? 1 : 3;
    const venueId =
      d.sport === 'rugby'
        ? index % 2
          ? 'norte'
          : 'pucara'
        : d.lineId === 'hockey-A'
          ? 'parque'
          : d.lineId === 'hockey-B'
            ? 'sintetica'
            : d.lineId === 'hockey-D'
              ? 'oeste'
              : 'norte';
    const venue = venues.find((v) => v.id === venueId)!;
    const divisionIndex =
      d.sport === 'hockey' && d.lineId
        ? divisions
            .filter((v) => v.lineId === d.lineId)
            .findIndex((v) => v.id === d.id)
        : 0;
    const hockeyTimes = [
      '16:00',
      '14:30',
      '13:00',
      '11:30',
      '10:00',
      '09:00',
      '08:00',
    ];
    for (const occurrence of [0, -1, 1]) {
      if (infant && occurrence === -1) continue;
      const date = offsetClubDay(day, baseOffset + occurrence * 7);
      const roundId = (d.lineId ?? d.groupId) + '-round-' + occurrence;
      if (!rounds.some((r) => r.id === roundId))
        rounds.push({
          id: roundId,
          sport: d.sport,
          title:
            (infant
              ? 'Encuentro '
              : d.sport === 'hockey'
                ? 'Jornada '
                : 'Fecha ') +
            (8 + occurrence),
          on: date,
          ...(d.lineId ? { lineId: d.lineId } : {}),
        });
      const time =
        d.sport === 'hockey' && divisionIndex >= 0
          ? hockeyTimes[divisionIndex]!
          : infant
            ? '10:00'
            : d.title === 'Primera'
              ? '15:30'
              : '13:30';
      const firstId =
        d.id === 'rugby-superior-0'
          ? 'rugby-primera'
          : d.id === 'hockey-A-0'
            ? 'hockey-primera'
            : d.id;
      const match: ClubMatch = {
        id: occurrence === 0 ? firstId : firstId + '-round-' + occurrence,
        sport: d.sport,
        division: d.title,
        divisionId: d.id,
        roundId,
        venueId,
        opponent:
          d.sport === 'rugby'
            ? 'Club del Sur'
            : hockeyLine === 0
              ? 'Club del Parque'
              : hockeyLine === 1
                ? 'Club del Norte'
                : 'Club del Oeste',
        venue:
          venueId === 'pucara' || venueId === 'sintetica' ? 'home' : 'away',
        startsAt: date + 'T' + time + ':00-03:00',
        location: venue.title + ' · ' + venue.address,
        status: occurrence === -1 ? 'played' : 'scheduled',
      };
      matches.push(match);
      if (occurrence === -1 && !infant)
        results.push({
          matchId: match.id,
          home: d.sport === 'hockey' ? 3 : 27,
          away: d.sport === 'hockey' ? 1 : 18,
        });
    }
  });
  return {
    fixture: {
      sports: [
        { id: 'rugby', title: 'Rugby', featuredDivisionId: 'rugby-superior-0' },
        { id: 'hockey', title: 'Hockey', featuredDivisionId: 'hockey-A-0' },
      ],
      groups,
      lines,
      divisions,
      rounds,
      venues,
      results,
    },
    matches,
  };
}
