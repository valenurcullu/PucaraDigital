import { describe, it, expect } from 'vitest';
import {
  createDemoExperience,
  resolveFixture,
  fixturesForDivision,
  fixtureResult,
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
    for (const line of data.fixture.lines)
      expect(
        data.fixture.divisions
          .filter((d) => d.lineId === line.id)
          .map((d) => d.title),
      ).toEqual([
        'Primera',
        'Intermedia',
        'Quinta',
        'Sexta',
        'Séptima',
        'Octava',
        'Novena',
      ]);
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
    expect(fixturesForDivision(data, 'rugby-superior-6').upcoming).toEqual([]);
  });
});
describe('fechas, sedes y marcadores', () => {
  it('separa próximos partidos de resultados previos conservando el orden de la fuente', () => {
    const before = data.matches.map((m) => m.id);
    const rows = fixturesForDivision(data, 'rugby-superior-0');
    expect(rows.upcoming).toHaveLength(2);
    expect(rows.previous).toHaveLength(1);
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
