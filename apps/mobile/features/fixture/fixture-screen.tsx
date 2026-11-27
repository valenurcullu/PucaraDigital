import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  resolveFixture,
  fixturesForDivision,
  fixtureResult,
  hockeyRound,
  type ClubMatch,
  type MemberExperience,
  type FixtureFilter,
} from '@pucara/shared';
import { MemberStage } from '../experience/member-stage';
import { Segments } from '../sports/common';
import { DemoCaption } from '../experience/identity-ui';
import { AppIcon } from '../../components/app-icon';
import {
  color,
  Command,
  Grid,
  Group,
  Label,
  layout,
  Pill,
  Sheet,
  Tap,
  longDate,
  shortDate,
} from '../../components/handoff-ui';
import { formatTime } from '../experience/navigation';
export function FixtureScreen() {
  const filter = useLocalSearchParams<{
    sport?: string;
    group?: string;
    line?: string;
    division?: string;
  }>();
  return (
    <MemberStage>
      {(data) => (
        <FixtureContent
          key={[filter.sport, filter.group, filter.line, filter.division].join(
            '/',
          )}
          data={data}
          initial={filter}
        />
      )}
    </MemberStage>
  );
}
type Panel = { kind: 'divisions' } | { kind: 'day'; match: ClubMatch } | null;
export function FixtureContent({
  data,
  initial = {},
}: {
  data: MemberExperience;
  initial?: FixtureFilter;
}) {
  const [filter, set] = useState<FixtureFilter>(initial),
    [all, showAll] = useState(false),
    [panel, show] = useState<Panel>(null);
  const selection = resolveFixture(data.fixture, filter);
  if (!selection)
    return (
      <View style={layout.page}>
        <Label>El club todavía no publicó su catálogo deportivo.</Label>
      </View>
    );
  const { sport, groups, group, lines, line, divisions, division } = selection;
  const change = (next: FixtureFilter) => {
    set(next);
    showAll(false);
    show(null);
  };
  const calendar = division
    ? fixturesForDivision(data, division.id)
    : { upcoming: [], previous: [] };
  const scored = group.scorePolicy === 'competitive';
  const next = calendar.upcoming[0];
  const upcoming = all ? calendar.upcoming : calendar.upcoming.slice(0, 1);
  const past = scored
    ? calendar.previous.filter((m) => fixtureResult(data, m))
    : [];
  const results = all ? past : past.slice(0, 1);
  const divisionLabel = division?.title ?? 'Sin divisiones';
  const dayMatch = panel?.kind === 'day' ? panel.match : undefined;
  const jornada = dayMatch ? hockeyRound(data, dayMatch) : [];
  const round = dayMatch
    ? data.fixture.rounds.find((r) => r.id === dayMatch.roundId)
    : undefined;
  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={layout.page}
      >
        <Segments
          values={data.fixture.sports.map((s) => ({
            id: s.id,
            title: s.title,
          }))}
          selected={sport.id}
          onSelect={(id) => change({ sport: id })}
        />
        <DemoCaption>
          Datos deportivos ficticios · configuración a validar con el club
        </DemoCaption>
        <View style={layout.group}>
          <Label role="label">
            {sport.id === 'rugby' ? 'Grupo' : 'Organización'}
          </Label>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ gap: 8 }}
          >
            {groups.map((g) => (
              <FilterChip
                key={g.id}
                title={g.title}
                selected={g.id === group.id}
                onPress={() => change({ sport: sport.id, group: g.id })}
              />
            ))}
          </ScrollView>
        </View>
        {lines.length > 0 && (
          <View style={layout.group}>
            <Label role="label">Línea</Label>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {lines.map((l) => (
                <FilterChip
                  key={l.id}
                  title={l.title}
                  selected={l.id === line?.id}
                  onPress={() =>
                    change({ sport: sport.id, group: group.id, line: l.id })
                  }
                />
              ))}
            </ScrollView>
          </View>
        )}
        <Tap
          label={'Elegir división · ' + divisionLabel}
          onPress={() => show({ kind: 'divisions' })}
          style={[layout.card, layout.row, { minHeight: 64 }]}
        >
          <View style={layout.grow}>
            <Label role="meta" ink={color.secondaryText}>
              División
            </Label>
            <Label role="section">{divisionLabel}</Label>
          </View>
          <Pill tone="blue">Elegir ›</Pill>
        </Tap>
        <View style={layout.between}>
          <Label role="section">
            {all
              ? 'Fixture completo'
              : scored
                ? 'Próxima fecha'
                : 'Próximos encuentros'}
          </Label>
          {line && <Pill tone="blue">{line.title}</Pill>}
        </View>
        {!division ? (
          <EmptyFixture />
        ) : upcoming.length ? (
          upcoming.map((match) => (
            <MatchFixture
              key={match.id}
              data={data}
              match={match}
              encounters={!scored}
            />
          ))
        ) : (
          <EmptyFixture />
        )}
        {sport.id === 'hockey' && line && next && (
          <Command
            title="Ver toda la jornada"
            variant="secondary"
            icon="calendar"
            onPress={() => show({ kind: 'day', match: next })}
          />
        )}
        {scored && (
          <Group title={all ? 'Resultados anteriores' : 'Resultado anterior'}>
            {results.length ? (
              results.map((match) => (
                <MatchFixture
                  key={match.id}
                  data={data}
                  match={match}
                  encounters={false}
                />
              ))
            ) : (
              <View style={layout.card}>
                <Label role="meta" ink={color.secondaryText}>
                  Sin resultados publicados para esta división.
                </Label>
              </View>
            )}
          </Group>
        )}
        {(calendar.upcoming.length > 0 || past.length > 0) && (
          <Command
            title={all ? 'Volver al resumen' : 'Ver fixture completo'}
            variant={all ? 'secondary' : 'navy'}
            onPress={() => showAll(!all)}
          />
        )}
      </ScrollView>
      {panel && (
        <Sheet
          title={
            panel.kind === 'divisions'
              ? 'Elegí división'
              : (line?.title ?? 'Jornada') +
                ' · ' +
                (round?.title ?? 'Encuentros')
          }
          onClose={() => show(null)}
        >
          {panel.kind === 'divisions' ? (
            <>
              <Label role="meta" ink={color.secondaryText}>
                {sport.title} · {line?.title ?? group.title}
              </Label>
              <Grid columns={3}>
                {divisions.map((d) => (
                  <Tap
                    key={d.id}
                    label={d.title}
                    selected={d.id === division?.id}
                    onPress={() =>
                      change({
                        sport: sport.id,
                        group: group.id,
                        ...(line ? { line: line.id } : {}),
                        division: d.id,
                      })
                    }
                    style={{
                      padding: 10,
                      minHeight: 48,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor:
                        d.id === division?.id ? color.navy : color.border,
                      backgroundColor:
                        d.id === division?.id ? color.navy : color.surface,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Label
                      role="card"
                      ink={d.id === division?.id ? 'white' : color.text}
                      style={{ textAlign: 'center' }}
                    >
                      {d.title}
                    </Label>
                  </Tap>
                ))}
              </Grid>
            </>
          ) : (
            <>
              <Label role="meta">
                {dayMatch ? longDate.format(new Date(dayMatch.startsAt)) : ''}
              </Label>
              {jornada.map((match) => (
                <View key={match.id} style={[layout.card, layout.group]}>
                  <View style={layout.between}>
                    <Label role="card">
                      {
                        data.fixture.divisions.find(
                          (d) => d.id === match.divisionId,
                        )?.title
                      }
                    </Label>
                    <Label role="number">{formatTime(match.startsAt)}</Label>
                  </View>
                  <Label role="meta">
                    vs. {match.opponent} ·{' '}
                    {match.venue === 'home' ? 'Local' : 'Visitante'}
                  </Label>
                  <Venue data={data} match={match} />
                </View>
              ))}
              <DemoCaption>
                Horarios y sedes demostrativos de esta línea
              </DemoCaption>
            </>
          )}
          <Command
            title="Cerrar"
            variant="secondary"
            onPress={() => show(null)}
          />
        </Sheet>
      )}
    </>
  );
}
function FilterChip({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Tap
      label={title}
      selected={selected}
      onPress={onPress}
      style={{
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderRadius: 22,
        backgroundColor: selected ? color.navy : color.surface,
        borderWidth: 1,
        borderColor: selected ? color.navy : color.hairline,
      }}
    >
      <Label role="label" ink={selected ? 'white' : color.text}>
        {title}
      </Label>
    </Tap>
  );
}
function EmptyFixture() {
  return (
    <View style={[layout.card, layout.group]}>
      <AppIcon name="calendar" color={color.secondaryText} />
      <Label role="card">Sin encuentros publicados</Label>
      <Label role="meta" ink={color.secondaryText}>
        Probá con otra división. Acá aparecerán sus próximas fechas.
      </Label>
    </View>
  );
}
function Venue({ data, match }: { data: MemberExperience; match: ClubMatch }) {
  const venue = data.fixture.venues.find((v) => v.id === match.venueId);
  return (
    <View style={[layout.row, { alignItems: 'flex-start', gap: 5 }]}>
      <AppIcon name="location" size={15} color={color.secondaryText} />
      <View style={layout.grow}>
        <Label role="meta" ink={color.secondaryText}>
          {venue?.title ?? match.location}
        </Label>
        {venue && (
          <Label role="meta" ink={color.secondaryText}>
            {venue.address}
          </Label>
        )}
      </View>
    </View>
  );
}
function MatchFixture({
  data,
  match,
  encounters,
}: {
  data: MemberExperience;
  match: ClubMatch;
  encounters: boolean;
}) {
  const score = encounters ? undefined : fixtureResult(data, match);
  const round = data.fixture.rounds.find((r) => r.id === match.roundId);
  return (
    <View style={[layout.card, layout.group]}>
      <View style={layout.between}>
        <Label role="label" ink={color.secondaryText}>
          {round?.title ?? 'Encuentro'}
        </Label>
        <Pill tone={match.venue === 'home' ? 'blue' : 'neutral'}>
          {match.venue === 'home' ? 'Local' : 'Visitante'}
        </Pill>
      </View>
      <View style={layout.row}>
        {score && (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                score.outcome === 'G'
                  ? color.successBackground
                  : score.outcome === 'P'
                    ? color.actionSoft
                    : color.subtle,
            }}
          >
            <Label
              role="card"
              ink={
                score.outcome === 'G'
                  ? color.success
                  : score.outcome === 'P'
                    ? color.action
                    : color.secondaryText
              }
            >
              {score.outcome}
            </Label>
          </View>
        )}
        <Label role="subhead" style={layout.grow}>
          vs. {match.opponent}
        </Label>
        {score && (
          <View style={{ alignItems: 'flex-end' }}>
            <Label role="label" ink={color.secondaryText}>
              Pucará / rival
            </Label>
            <Label role="number">
              {score.pucara} – {score.opponent}
            </Label>
          </View>
        )}
      </View>
      <Label role="smallNumber">
        {shortDate.format(new Date(match.startsAt))} ·{' '}
        {formatTime(match.startsAt)}
      </Label>
      <Venue data={data} match={match} />
    </View>
  );
}
