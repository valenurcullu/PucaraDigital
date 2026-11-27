import { useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  resolveFixture,
  fixtureJornadas,
  fixtureResult,
  fixtureTeamTitle,
  clubDay,
  type ClubMatch,
  type MemberExperience,
  type FixtureFilter,
  type FixtureView,
} from '@pucara/shared';
import { MemberStage } from '../experience/member-stage';
import { Segments } from '../sports/common';
import { DemoCaption } from '../experience/identity-ui';
import {
  color,
  Label,
  layout,
  Tap,
  longDate,
} from '../../components/handoff-ui';
import { formatTime } from '../experience/navigation';

export function FixtureScreen() {
  const initial = useLocalSearchParams<{
    sport?: string;
    group?: string;
    line?: string;
    division?: string;
  }>();
  return (
    <MemberStage>
      {(data) => (
        <FixtureContent
          key={[
            initial.sport,
            initial.group,
            initial.line,
            initial.division,
          ].join('/')}
          data={data}
          initial={initial}
        />
      )}
    </MemberStage>
  );
}
export function FixtureContent({
  data,
  initial = {},
}: {
  data: MemberExperience;
  initial?: FixtureFilter;
}) {
  const [filter, setFilter] = useState<FixtureFilter>(initial);
  const [view, setView] = useState<FixtureView>('upcoming');
  const [roundId, setRoundId] = useState<string>();
  const selection = resolveFixture(data.fixture, filter);
  if (!selection)
    return (
      <View style={layout.page}>
        <Label>El club todavía no publicó su catálogo deportivo.</Label>
      </View>
    );
  const { sport, group, line } = selection;
  const competitive = group.scorePolicy === 'competitive';
  const effectiveView = competitive ? view : 'upcoming';
  const jornadas = fixtureJornadas(data, filter, effectiveView);
  const selectedIndex = jornadas.findIndex((j) => j.round.id === roundId);
  const index =
    selectedIndex >= 0
      ? selectedIndex
      : effectiveView === 'results'
        ? jornadas.length - 1
        : 0;
  const jornada = jornadas[index];
  const change = (next: FixtureFilter) => {
    setFilter(next);
    setRoundId(undefined);
    setView('upcoming');
  };
  const scopes = data.fixture.groups
    .filter((g) => g.sport === sport.id)
    .flatMap((g) => {
      const lines = data.fixture.lines.filter((l) => l.groupId === g.id);
      return lines.length
        ? lines.map((l) => ({
            id: l.id,
            title: l.title,
            filter: { sport: sport.id, group: g.id, line: l.id },
          }))
        : [
            {
              id: g.id,
              title: g.title,
              filter: { sport: sport.id, group: g.id },
            },
          ];
    });
  const days = [
    ...new Set(
      jornada?.matches.map((m) => clubDay(new Date(m.startsAt))) ?? [],
    ),
  ];
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={[layout.page, { gap: 16 }]}
    >
      <Segments
        values={data.fixture.sports.map((s) => ({ id: s.id, title: s.title }))}
        selected={sport.id}
        onSelect={(sport) => change({ sport })}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {scopes.map((scope) => (
          <Tap
            key={scope.id}
            label={scope.title}
            selected={scope.id === (line?.id ?? group.id)}
            onPress={() => change(scope.filter)}
            style={{
              minHeight: 44,
              paddingHorizontal: 14,
              paddingVertical: 11,
              borderRadius: 22,
              backgroundColor:
                scope.id === (line?.id ?? group.id)
                  ? color.navy
                  : color.surface,
              borderWidth: 1,
              borderColor:
                scope.id === (line?.id ?? group.id)
                  ? color.navy
                  : color.hairline,
            }}
          >
            <Label
              role="label"
              ink={
                scope.id === (line?.id ?? group.id)
                  ? color.inverseText
                  : color.secondaryText
              }
            >
              {scope.title}
            </Label>
          </Tap>
        ))}
      </ScrollView>
      {competitive ? (
        <Segments
          values={[
            { id: 'upcoming', title: 'Próxima fecha' },
            { id: 'results', title: 'Resultados' },
          ]}
          selected={effectiveView}
          onSelect={(id) => {
            setView(id === 'results' ? 'results' : 'upcoming');
            setRoundId(undefined);
          }}
        />
      ) : (
        <Label role="section">Próximos encuentros</Label>
      )}
      <DemoCaption>
        Datos deportivos ficticios · No es un fixture oficial.
      </DemoCaption>
      {jornada && (
        <View style={layout.row}>
          <RoundArrow
            previous
            disabled={index <= 0}
            onPress={() => setRoundId(jornadas[index - 1]?.round.id)}
          />
          <View
            accessibilityLiveRegion="polite"
            style={[layout.grow, { alignItems: 'center', gap: 3 }]}
          >
            <Label role="subhead">{jornada.round.title}</Label>
            <Label role="meta" ink={color.secondaryText}>
              {dayLabel(days[0] ?? jornada.round.on)}
              {days.length > 1 ? ' — ' + dayLabel(days.at(-1)!) : ''}
            </Label>
          </View>
          <RoundArrow
            disabled={index >= jornadas.length - 1}
            onPress={() => setRoundId(jornadas[index + 1]?.round.id)}
          />
        </View>
      )}
      {effectiveView === 'results' && jornada && (
        <Label role="label" ink={color.secondaryText}>
          Marcador Pucará / rival
        </Label>
      )}
      {!jornada?.matches.length ? (
        <View style={[layout.card, { gap: 6, padding: 20 }]}>
          <Label role="card">
            {effectiveView === 'results'
              ? 'Sin resultados publicados'
              : 'Sin partidos publicados para esta jornada'}
          </Label>
          <Label role="meta" ink={color.secondaryText}>
            {effectiveView === 'results'
              ? 'Los marcadores aparecerán cuando estén disponibles.'
              : 'Podés consultar otra jornada o cambiar de grupo.'}
          </Label>
        </View>
      ) : (
        days.map((day) => (
          <View key={day} style={{ gap: 8 }}>
            <Label role="label" ink={color.secondaryText}>
              {longDate.format(new Date(day + 'T12:00:00-03:00'))}
            </Label>
            <View style={[layout.card, { padding: 0, overflow: 'hidden' }]}>
              {jornada.matches
                .filter((m) => clubDay(new Date(m.startsAt)) === day)
                .map((match, i) => (
                  <View
                    key={match.id}
                    style={
                      i
                        ? { borderTopWidth: 1, borderTopColor: color.hairline }
                        : undefined
                    }
                  >
                    <FixtureRow
                      data={data}
                      match={match}
                      results={effectiveView === 'results'}
                    />
                  </View>
                ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
function dayLabel(day: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date(day + 'T12:00:00-03:00'));
}
function RoundArrow({
  previous = false,
  disabled,
  onPress,
}: {
  previous?: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Tap
      label={previous ? 'Jornada anterior' : 'Jornada siguiente'}
      disabled={disabled}
      onPress={onPress}
      style={{
        minHeight: 44,
        width: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color.surface,
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <Label
        role="smallNumber"
        ink={color.navy}
        style={{ fontFamily: undefined, fontSize: 28, lineHeight: 30 }}
      >
        {previous ? '‹' : '›'}
      </Label>
    </Tap>
  );
}
function FixtureRow({
  data,
  match,
  results,
}: {
  data: MemberExperience;
  match: ClubMatch;
  results: boolean;
}) {
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale > 1.35;
  const title = fixtureTeamTitle(data, match);
  const venue =
    data.fixture.venues.find((v) => v.id === match.venueId)?.title ??
    match.location;
  const location =
    (match.venue === 'home' ? 'Local' : 'Visitante') + ' · ' + venue;
  const score = results ? fixtureResult(data, match) : undefined;
  const time = formatTime(match.startsAt);
  return (
    <View
      accessible
      accessibilityLabel={[
        title,
        time,
        'vs. ' + match.opponent,
        location,
        results
          ? score
            ? 'Pucará ' + score.pucara + ', rival ' + score.opponent
            : 'Resultado pendiente'
          : '',
      ]
        .filter(Boolean)
        .join('. ')}
      style={{ paddingHorizontal: 12, paddingVertical: 12, gap: 6 }}
    >
      <View style={[layout.row, { gap: 10, alignItems: 'center' }]}>
        <View style={stacked ? layout.grow : { width: 78 }}>
          <Label role="label" style={{ fontSize: 13 }}>
            {title}
          </Label>
        </View>
        <Label
          role="smallNumber"
          ink={results ? color.secondaryText : color.navy}
          style={{ fontSize: 20 }}
        >
          {time}
        </Label>
        {!stacked && (
          <View style={[layout.grow, { gap: 4 }]}>
            <Label role="meta">vs. {match.opponent}</Label>
            <Label
              role="label"
              ink={color.secondaryText}
              style={{ fontWeight: '400' }}
            >
              {location}
            </Label>
          </View>
        )}
        {results && (
          <Label
            role="smallNumber"
            ink={score?.outcome === 'G' ? color.success : color.text}
          >
            {score ? score.pucara + ' – ' + score.opponent : 'Pendiente'}
          </Label>
        )}
      </View>
      {stacked && (
        <View style={{ gap: 4 }}>
          <Label role="meta">vs. {match.opponent}</Label>
          <Label role="label" ink={color.secondaryText}>
            {location}
          </Label>
        </View>
      )}
    </View>
  );
}
