import { describe, it, expect } from 'vitest';
import {
  createDemoExperience,
  resolveFixture,
  fixturesForDivision,
  fixtureResult,
  fixtureJornadas,
  fixtureTeamTitle,
  hockeyRound,
  selectFirstTeamMatches,
  selectPersonalEvents,
  type FixtureFilter,
} from './index';
const data = createDemoExperience('2026-11-27');
const select = (filter: FixtureFilter) => resolveFixture(data.fixture, filter)!;
describe('catálogo y selección deportiva', () => {
  it('incluye todas las divisiones solicitadas y referencias válidas en los ejemplos', () => {
    expect(
      data.fixture.divisions
        .filter((d) => d.groupId === 'rugby-superior')
        .map((d) => d.title),
    ).toEqual([
      'Primera',
      'Intermedia',
      'Pre A',
      'Pre B',
      'Pre C',
      'Pre D',
      'Pre E',
    ]);
    expect(
      data.fixture.divisions
        .filter((d) => d.groupId === 'rugby-juveniles')
        .map((d) => d.title),
    ).toEqual(['M15', 'M16', 'M17', 'M18', 'M19']);
    expect(
      data.fixture.divisions
        .filter((d) => d.groupId === 'rugby-infantiles')
        .map((d) => d.title),
    ).toEqual([
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
    expect(data.fixture.lines.map((l) => l.title)).toEqual([
      'Línea A',
      'Línea B',
      'Línea C',
      'Línea D',
    ]);
    expect(
      data.fixture.lines.map(
        (line) =>
          data.fixture.divisions.filter((d) => d.lineId === line.id).length,
      ),
    ).toEqual([7, 7, 6, 5]);
    expect(
      select({ sport: 'hockey', group: 'hockey-otras' }).divisions.map(
        (d) => d.title,
      ),
    ).toEqual(['Cuarta', 'Décima', 'Escuelita']);
    expect(new Set(data.fixture.divisions.map((d) => d.id)).size).toBe(
      data.fixture.divisions.length,
    );
    for (const m of data.matches) {
      expect(data.fixture.venues.some((v) => v.id === m.venueId)).toBe(true);
      expect(data.fixture.rounds.some((r) => r.id === m.roundId)).toBe(true);
      expect(
        data.fixture.divisions.some(
          (d) =>
            d.id === m.divisionId &&
            d.sport === m.sport &&
            d.title === m.division,
        ),
      ).toBe(true);
    }
  });
  it('cambia deporte, grupo, línea y división sin conservar una selección incompatible', () => {
    expect(
      select({
        sport: 'hockey',
        group: 'rugby-juveniles',
        division: 'rugby-juveniles-1',
      }).group.id,
    ).toBe('hockey-lineas');
    const juveniles = select({
      sport: 'rugby',
      group: 'rugby-juveniles',
      division: 'rugby-juveniles-4',
    });
    expect(juveniles.division?.title).toBe('M19');
    const b = select({
      sport: 'hockey',
      line: 'hockey-B',
      division: 'hockey-A-1',
    });
    expect(b.line?.title).toBe('Línea B');
    expect(b.division?.id).toBe('hockey-B-0');
    const other = select({
      sport: 'hockey',
      group: 'hockey-otras',
      line: 'hockey-A',
    });
    expect(other.line).toBeUndefined();
    expect(other.division?.title).toBe('Cuarta');
  });
  it('admite agregar o quitar divisiones sin rutas nuevas y resuelve los estados vacíos', () => {
    const extra = {
      id: 'nueva',
      sport: 'rugby' as const,
      groupId: 'rugby-superior',
      title: 'Nueva división',
    };
    const fixture = {
      ...data.fixture,
      divisions: [...data.fixture.divisions, extra],
    };
    expect(resolveFixture(fixture, { division: 'nueva' })?.division).toEqual(
      extra,
    );
    expect(fixturesForDivision(data, 'nueva')).toEqual({
      upcoming: [],
      previous: [],
    });
    expect(
      resolveFixture(
        {
          ...fixture,
          divisions: fixture.divisions.filter((d) => d.id !== 'nueva'),
        },
        { division: 'nueva' },
      )?.division?.title,
    ).toBe('Primera');
    expect(
      select({ sport: 'rugby', division: 'rugby-superior-6' }).division?.title,
    ).toBe('Pre E');
    expect(fixturesForDivision(data, 'rugby-superior-6').upcoming).toHaveLength(
      2,
    );
  });
});
describe('fechas, sedes y marcadores', () => {
  it('separa próximos partidos de resultados previos conservando el orden de la fuente', () => {
    const before = data.matches.map((m) => m.id);
    const rows = fixturesForDivision(data, 'rugby-superior-0');
    expect(rows.upcoming).toHaveLength(2);
    expect(rows.previous).toHaveLength(2);
    expect(rows.upcoming[0]?.id).toBe('rugby-primera');
    expect(
      rows.upcoming.every(
        (m) =>
          Date.parse(m.startsAt) >= Date.parse(data.referenceInstant) &&
          m.status === 'scheduled',
      ),
    ).toBe(true);
    expect(
      rows.previous.every(
        (m) => Date.parse(m.startsAt) < Date.parse(data.referenceInstant),
      ),
    ).toBe(true);
    expect(data.matches.map((m) => m.id)).toEqual(before);
  });
  it('muestra el marcador de Pucará tanto de local como de visitante, incluidos empates', () => {
    const local = fixturesForDivision(data, 'rugby-superior-0').previous[0]!,
      away = fixturesForDivision(data, 'hockey-A-0').previous[0]!;
    expect(fixtureResult(data, local)).toEqual({
      pucara: 27,
      opponent: 18,
      outcome: 'G',
    });
    expect(fixtureResult(data, away)).toEqual({
      pucara: 1,
      opponent: 3,
      outcome: 'P',
    });
    expect(
      fixtureResult(
        {
          ...data,
          fixture: {
            ...data.fixture,
            results: [{ matchId: away.id, home: 2, away: 2 }],
          },
        },
        away,
      ),
    ).toMatchObject({ outcome: 'E' });
  });
  it('impide marcadores infantiles incluso ante un dato mal clasificado', () => {
    const child = fixturesForDivision(data, 'rugby-infantiles-4').upcoming[0]!;
    const played = {
      ...child,
      status: 'played' as const,
      startsAt: '2026-11-20T10:00:00-03:00',
    };
    const invalid = {
      ...data,
      matches: [...data.matches, played],
      fixture: {
        ...data.fixture,
        results: [
          ...data.fixture.results,
          { matchId: played.id, home: 5, away: 0 },
        ],
      },
    };
    expect(fixtureResult(invalid, played)).toBeUndefined();
    expect(
      data.fixture.results.some(
        (result) =>
          data.matches.find((m) => m.id === result.matchId)?.divisionId ===
          child.divisionId,
      ),
    ).toBe(false);
  });
  it('mantiene horarios de cada categoría y sedes independientes por línea y partido', () => {
    const a = fixturesForDivision(data, 'hockey-A-0').upcoming[0]!,
      b = fixturesForDivision(data, 'hockey-B-0').upcoming[0]!;
    const dayA = hockeyRound(data, a),
      dayB = hockeyRound(data, b);
    expect(dayA).toHaveLength(7);
    expect(dayB).toHaveLength(7);
    expect(new Set(dayA.map((m) => m.startsAt)).size).toBe(7);
    expect(a.venueId).not.toBe(b.venueId);
    expect(dayA.every((m) => m.venueId === 'parque')).toBe(true);
    expect(dayB.every((m) => m.venueId === 'sintetica')).toBe(true);
    const mixed = {
      ...data,
      matches: data.matches.map((m) =>
        m.id === dayA[0]?.id
          ? { ...m, venueId: 'oeste' }
          : m.divisionId.startsWith('hockey-B-')
            ? { ...m, roundId: a.roundId }
            : m,
      ),
    };
    const round = hockeyRound(mixed, a);
    expect(round).toHaveLength(7);
    expect(round[0]?.venueId).toBe('oeste');
    expect(round.some((m) => m.divisionId.startsWith('hockey-B-'))).toBe(false);
  });
  it('usa las mismas próximas Primeras en Inicio y fixture y permite configurar la línea destacada', () => {
    const featured = selectFirstTeamMatches(data);
    for (const m of featured)
      expect(fixturesForDivision(data, m.divisionId).upcoming[0]).toBe(m);
    expect(featured.map((m) => m.id)).toEqual([
      'rugby-primera',
      'hockey-primera',
    ]);
    expect(
      Date.parse(fixturesForDivision(data, 'hockey-B-0').upcoming[0]!.startsAt),
    ).toBeLessThan(Date.parse(featured[1]!.startsAt));
    const changed = {
      ...data,
      fixture: {
        ...data.fixture,
        sports: data.fixture.sports.map((s) =>
          s.id === 'hockey' ? { ...s, featuredDivisionId: 'hockey-B-0' } : s,
        ),
      },
    };
    expect(selectFirstTeamMatches(changed)[1]?.divisionId).toBe('hockey-B-0');
    expect(
      selectPersonalEvents(data).some((e) => e.target.kind === 'match'),
    ).toBe(false);
  });
});
describe('jornadas completas por grupo o línea', () => {
  it('muestra todas las divisiones superiores sin filtrar por una división heredada', () => {
    const scope = {
      sport: 'rugby',
      group: 'rugby-superior',
      division: 'rugby-superior-2',
    };
    const rounds = fixtureJornadas(data, scope, 'upcoming');
    expect(rounds).toHaveLength(3);
    expect(rounds[0]!.matches.map((m) => m.division)).toEqual([
      'Primera',
      'Intermedia',
      'Pre A',
      'Pre B',
      'Pre C',
      'Pre D',
      'Pre E',
    ]);
    expect(new Set(rounds[0]!.matches.map((m) => m.division))).toEqual(
      new Set([
        'Primera',
        'Intermedia',
        'Pre A',
        'Pre B',
        'Pre C',
        'Pre D',
        'Pre E',
      ]),
    );
    expect(rounds[2]!.matches).toEqual([]);
    expect(
      new Set(rounds[0]!.matches.map((m) => m.venueId)).size,
    ).toBeGreaterThan(1);
    expect(
      new Set(rounds[0]!.matches.map((m) => m.opponent)).size,
    ).toBeGreaterThan(1);
  });
  it('incluye equipos juveniles A/B/C, rivales, sedes y días diferentes', () => {
    const rows = fixtureJornadas(
      data,
      { group: 'rugby-juveniles' },
      'upcoming',
    )[0]!.matches;
    expect(rows).toHaveLength(10);
    expect(rows.map((m) => fixtureTeamTitle(data, m))).toEqual(
      expect.arrayContaining([
        'M15 A',
        'M15 B',
        'M17 A',
        'M17 B',
        'M17 C',
        'M19 B',
      ]),
    );
    expect(new Set(rows.map((m) => m.startsAt.slice(0, 10))).size).toBe(2);
    expect(new Set(rows.map((m) => m.venueId)).size).toBe(3);
    expect(new Set(rows.map((m) => m.opponent)).size).toBe(3);
  });
  it('incluye todas las categorías infantiles y nunca devuelve resultados', () => {
    const filter = { group: 'rugby-infantiles' };
    expect(fixtureJornadas(data, filter, 'upcoming')[0]!.matches).toHaveLength(
      11,
    );
    expect(fixtureJornadas(data, filter, 'results')).toEqual([]);
    const invalid = {
      ...data,
      matches: data.matches.map((m) => ({
        ...m,
        status: 'played' as const,
        startsAt: '2026-11-01T10:00:00-03:00',
      })),
    };
    expect(fixtureJornadas(invalid, filter, 'results')).toEqual([]);
  });
  it('configura todas las líneas de hockey con sus propias categorías y sedes por partido', () => {
    for (const line of data.fixture.lines) {
      const round = fixtureJornadas(
        data,
        { sport: 'hockey', line: line.id },
        'upcoming',
      )[0]!;
      expect(round.matches).toHaveLength(
        data.fixture.divisions.filter((d) => d.lineId === line.id).length,
      );
      expect(
        round.matches.every(
          (m) =>
            data.fixture.divisions.find((d) => d.id === m.divisionId)
              ?.lineId === line.id,
        ),
      ).toBe(true);
    }
    const a = fixtureJornadas(
      data,
      { sport: 'hockey', line: 'hockey-A' },
      'upcoming',
    )[0]!;
    const b = fixtureJornadas(
      data,
      { sport: 'hockey', line: 'hockey-B' },
      'upcoming',
    )[0]!;
    expect(a.matches[0]!.venueId).not.toBe(b.matches[0]!.venueId);
    const d = fixtureJornadas(
      data,
      { sport: 'hockey', line: 'hockey-D' },
      'upcoming',
    )[0]!;
    expect(new Set(d.matches.map((m) => m.venueId)).size).toBe(2);
    const special = fixtureJornadas(
      data,
      { sport: 'hockey', group: 'hockey-otras' },
      'upcoming',
    )[0]!;
    expect(special.matches.map((m) => m.division)).toEqual([
      'Cuarta',
      'Décima',
      'Escuelita',
    ]);
    expect(
      new Set(special.matches.map((m) => m.startsAt.slice(0, 10))).size,
    ).toBe(2);
  });
  it('navega jornadas cronológicas, resultados previos y vacíos sin mutar la fuente', () => {
    const before = data.matches.slice();
    const rounds = fixtureJornadas(
      data,
      { group: 'rugby-superior' },
      'results',
    );
    expect(rounds).toHaveLength(2);
    expect(rounds[0]!.round.on < rounds[1]!.round.on).toBe(true);
    expect(
      rounds.every(
        (r) =>
          r.matches.length === 7 &&
          r.matches.every((m) => fixtureResult(data, m)),
      ),
    ).toBe(true);
    expect(
      fixtureJornadas({ ...data, matches: [] }, { sport: 'rugby' }, 'results'),
    ).toEqual([]);
    expect(
      fixtureJornadas(
        { ...data, matches: [] },
        { sport: 'rugby' },
        'upcoming',
      ).every((r) => !r.matches.length),
    ).toBe(true);
    expect(data.matches).toEqual(before);
  });
  it('conserva el mismo partido de Primera destacado en Inicio dentro de la jornada', () => {
    for (const match of selectFirstTeamMatches(data)) {
      const rounds = fixtureJornadas(
        data,
        { sport: match.sport, division: match.divisionId },
        'upcoming',
      );
      expect(rounds[0]!.matches.find((m) => m.id === match.id)).toBe(match);
    }
  });
});
it('incluye categorías nuevas sin rutas ni filtros individuales y mantiene el ámbito', () => {
  const first = fixtureJornadas(
    data,
    { sport: 'hockey', line: 'hockey-D' },
    'upcoming',
  )[0]!;
  const division = {
    id: 'hockey-D-extra',
    sport: 'hockey' as const,
    groupId: 'hockey-lineas',
    lineId: 'hockey-D',
    title: 'Nueva',
  };
  const match = {
    ...first.matches[0]!,
    id: 'extra',
    divisionId: division.id,
    division: division.title,
  };
  const changed = {
    ...data,
    fixture: {
      ...data.fixture,
      divisions: [...data.fixture.divisions, division],
    },
    matches: [...data.matches, match],
  };
  expect(
    fixtureJornadas(
      changed,
      { sport: 'hockey', line: 'hockey-D' },
      'upcoming',
    )[0]!.matches,
  ).toContain(match);
  expect(fixtureTeamTitle(changed, match)).toBe('Nueva');
  const mixed = {
    ...changed,
    matches: changed.matches.map((m) =>
      m.divisionId.startsWith('hockey-A-')
        ? { ...m, roundId: first.round.id }
        : m,
    ),
  };
  expect(
    fixtureJornadas(
      mixed,
      { sport: 'hockey', line: 'hockey-D' },
      'upcoming',
    )[0]!.matches,
  ).toHaveLength(6);
});
