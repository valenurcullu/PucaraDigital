import { ScrollView, View } from 'react-native';
import {
  selectFirstTeamMatches,
  selectPersonalEvents,
  type MemberExperience,
  type ModuleId,
} from '@pucara/shared';
import { AppIcon } from '../../components/app-icon';
import {
  color,
  DateBlock,
  Grid,
  Group,
  Label,
  layout,
  longDate,
  Pill,
  shortDate,
  Tap,
} from '../../components/handoff-ui';
import { MemberStage } from './member-stage';
import { formatMoney, formatTime, moduleHref, targetHref } from './navigation';
import { modulePresentation } from './module-presentation';

export function ResourceTile({
  padel,
  data,
  wide = false,
}: {
  padel: boolean;
  data: MemberExperience;
  wide?: boolean;
}) {
  const name = padel ? 'Pádel' : 'Quinchos',
    action = padel ? 'Reservar pádel' : 'Reservar quincho';
  const detail = padel
    ? wide
      ? '90 min · ' + formatMoney(data.padel.priceMinor) + ' o 1 crédito'
      : 'Turnos de 90 min'
    : wide
      ? 'Consultá disponibilidad'
      : 'Para reuniones y eventos';
  const cta = (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: padel ? 'white' : 'rgba(255,255,255,.16)',
      }}
    >
      <Label role="label" ink={padel ? color.action : 'white'}>
        {padel ? 'Reservar →' : 'Consultar →'}
      </Label>
    </View>
  );
  return (
    <Tap
      href={padel ? '/club/padel' : moduleHref('quinchos')}
      label={action}
      style={[
        wide ? layout.row : layout.tile,
        {
          flex: wide ? undefined : 1,
          minHeight: wide ? 90 : 164,
          padding: 16,
          borderRadius: 20,
          backgroundColor: padel ? color.action : color.navy,
        },
      ]}
    >
      <AppIcon name={padel ? 'padel' : 'quincho'} size={32} color="white" />
      <View style={wide ? layout.grow : undefined}>
        <Label role="sheet" ink="white">
          {name}
        </Label>
        <Label role="meta" ink="white">
          {detail}
        </Label>
      </View>
      {cta}
    </Tap>
  );
}
function Hero({ data }: { data: MemberExperience }) {
  return (
    <View
      style={{
        backgroundColor: color.navy,
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 22,
        gap: 12,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
      }}
    >
      <View style={layout.between}>
        <View style={layout.row}>
          <View
            style={{
              backgroundColor: color.action,
              width: 34,
              height: 34,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Label role="day" ink="white">
              P
            </Label>
          </View>
          <Label
            role="number"
            ink="white"
            style={{ fontSize: 16, letterSpacing: 2.5 }}
          >
            PUCARÁ
          </Label>
          <Pill tone="warning">DEMO</Pill>
        </View>
        <Tap
          href="/cuenta"
          label="Abrir Cuenta"
          style={{
            minWidth: 44,
            minHeight: 44,
            borderRadius: 24,
            backgroundColor: '#324258',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Label role="label" ink="white">
            {data.member.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Label>
        </Tap>
      </View>
      <View>
        <Label
          role="meta"
          ink={color.onDarkMuted}
          style={{ textTransform: 'capitalize' }}
        >
          {longDate.format(new Date(data.referenceInstant))}
        </Label>
        <Label role="greeting" ink="white">
          Hola, {data.member.firstName}
        </Label>
      </View>
      <Tap
        href="/turnos"
        label="Reservar pádel"
        style={[
          layout.row,
          {
            padding: 14,
            minHeight: 58,
            borderRadius: 16,
            backgroundColor: color.action,
          },
        ]}
      >
        <AppIcon name="padel" color="white" />
        <Label role="button" ink="white" style={layout.grow}>
          Reservar pádel
        </Label>
        <View
          style={{
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 5,
            backgroundColor: 'rgba(255,255,255,.18)',
          }}
        >
          <Label role="label" ink="white">
            {data.padel.availableCredits}{' '}
            {data.padel.availableCredits === 1 ? 'crédito' : 'créditos'}
          </Label>
        </View>
        <AppIcon name="chevron" color="white" size={15} />
      </Tap>
      <Grid columns={3}>
        {(['quinchos', 'gimnasio', 'cuenta-corriente'] as const).map(
          (id, i) => (
            <Tap
              key={id}
              href={moduleHref(id)}
              label={modulePresentation[id].action}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                minHeight: 64,
                padding: 5,
                borderRadius: 14,
                backgroundColor: '#2C3C50',
              }}
            >
              <AppIcon
                name={modulePresentation[id].icon}
                color="white"
                size={23}
              />
              <Label role="label" ink="white" style={{ textAlign: 'center' }}>
                {['Quinchos', 'Gimnasio', 'Cuenta'][i]}
              </Label>
            </Tap>
          ),
        )}
      </Grid>
    </View>
  );
}
export function HomePage() {
  return (
    <MemberStage root hero>
      {(data) => (
        <ScrollView contentInsetAdjustmentBehavior="never">
          <Hero data={data} />
          <View style={layout.page}>
            <Group title="Próximo para vos" action="Agenda" href="/agenda">
              <View style={{ gap: 8 }}>
                {selectPersonalEvents(data)
                  .slice(0, 3)
                  .map((e) => (
                    <View key={e.id}>
                      <Tap
                        label={e.title + ' ' + formatTime(e.startsAt)}
                        href={
                          e.target.kind === 'reservation' &&
                          data.reservations.some(
                            (r) =>
                              r.id === e.target.id && r.resource === 'padel',
                          )
                            ? {
                                pathname: '/turnos',
                                params: { manage: e.target.id },
                              }
                            : targetHref(e.target)
                        }
                        style={[
                          layout.card,
                          layout.row,
                          { padding: 10, minHeight: 64 },
                        ]}
                      >
                        <DateBlock instant={e.startsAt} />
                        <View style={layout.grow}>
                          <Label role="card">{e.title}</Label>
                          <Label role="meta" ink={color.secondaryText}>
                            {formatTime(e.startsAt)} · {e.location}
                          </Label>
                        </View>
                        <Pill
                          tone={e.kind === 'reservation' ? 'success' : 'blue'}
                        >
                          {e.kind === 'reservation'
                            ? 'Confirmada'
                            : e.kind === 'activity'
                              ? 'Clase'
                              : 'Deporte'}
                        </Pill>
                      </Tap>
                    </View>
                  ))}
                {!selectPersonalEvents(data).length && (
                  <Label>Sin próximos eventos</Label>
                )}
              </View>
            </Group>
            <Group title="Primera" action="Ver fixture" href="/fixture">
              <Grid columns={2}>
                {selectFirstTeamMatches(data).map((m) => (
                  <Tap
                    key={m.id}
                    label={'Ver partido de ' + m.sport}
                    href={targetHref({ kind: 'match', id: m.id })}
                    style={[layout.card, layout.tile, { flex: 1 }]}
                  >
                    <View style={layout.between}>
                      <AppIcon name={m.sport} color={color.action} size={18} />
                      <Label
                        role="label"
                        ink={color.action}
                        style={{ textTransform: 'uppercase' }}
                      >
                        {m.sport}
                      </Label>
                      <Pill tone={m.venue === 'home' ? 'blue' : 'neutral'}>
                        {m.venue === 'home' ? 'Local' : 'Visitante'}
                      </Pill>
                    </View>
                    <View>
                      <Label role="meta" ink={color.secondaryText}>
                        vs
                      </Label>
                      <Label role="card">{m.opponent}</Label>
                    </View>
                    <Label role="smallNumber">
                      {shortDate.format(new Date(m.startsAt))} ·{' '}
                      {formatTime(m.startsAt)}
                    </Label>
                  </Tap>
                ))}
              </Grid>
            </Group>
            <Group
              title="Novedades"
              action="Ver todas"
              href={moduleHref('novedades')}
            >
              {data.notices.slice(0, 3).map((n, i) => (
                <Tap
                  key={n.id}
                  label={n.title}
                  href={targetHref({ kind: 'notice', id: n.id })}
                  style={[layout.card, layout.row, { padding: 10 }]}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      overflow: 'hidden',
                      backgroundColor:
                        i % 2 ? color.navySoft : color.actionSoft,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {[0, 1, 2, 3, 4].map((j) => (
                      <View
                        key={j}
                        style={{
                          position: 'absolute',
                          left: j * 18 - 18,
                          width: 6,
                          height: 110,
                          transform: [{ rotate: '32deg' }],
                          backgroundColor: i % 2 ? '#D0DBE7' : '#EED2D7',
                        }}
                      />
                    ))}
                  </View>
                  <View style={layout.grow}>
                    <Label role="label" ink={color.action}>
                      {n.category.toUpperCase()}
                    </Label>
                    <Label role="card">{n.title}</Label>
                    <Label role="meta" ink={color.secondaryText}>
                      {n.summary}
                    </Label>
                  </View>
                </Tap>
              ))}
            </Group>
          </View>
        </ScrollView>
      )}
    </MemberStage>
  );
}
function SmallModule({
  id,
  data,
  compact = false,
}: {
  id: ModuleId;
  data: MemberExperience;
  compact?: boolean;
}) {
  const m = data.modules.find((x) => x.id === id)!;
  return (
    <Tap
      label={m.title}
      href={moduleHref(id)}
      style={[
        layout.card,
        layout.tile,
        { flex: 1, minHeight: compact ? 80 : 94, padding: compact ? 8 : 12 },
      ]}
    >
      <AppIcon
        name={modulePresentation[id].icon}
        size={compact ? 26 : 28}
        color={color.navy}
      />
      <Label
        role={compact ? 'label' : 'card'}
        style={compact ? { fontSize: 11 } : undefined}
      >
        {id === 'novedades' ? 'Noticias' : m.title}
      </Label>
    </Tap>
  );
}
export function ClubPage() {
  return (
    <MemberStage root>
      {(data) => {
        const reservations = data.reservations
          .filter((r) => r.status !== 'cancelled')
          .slice()
          .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
        const next = reservations[0];
        return (
          <ScrollView
            contentContainerStyle={layout.page}
            contentInsetAdjustmentBehavior="never"
          >
            <Label role="title">Club</Label>
            <Group title="Reservas">
              <Grid columns={2}>
                {[true, false].map((p) => (
                  <ResourceTile key={String(p)} padel={p} data={data} />
                ))}
              </Grid>
              <Tap
                label="Mis reservas"
                href="/club/reservas"
                style={[layout.card, layout.row]}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    backgroundColor: color.navySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppIcon name="reservations" />
                  <View
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      minWidth: 20,
                      borderRadius: 12,
                      backgroundColor: color.action,
                      alignItems: 'center',
                      borderColor: 'white',
                      borderWidth: 2,
                    }}
                  >
                    <Label role="label" ink="white">
                      {reservations.length}
                    </Label>
                  </View>
                </View>
                <View style={layout.grow}>
                  <Label role="card">Mis reservas</Label>
                  <Label role="meta" ink={color.secondaryText}>
                    {next
                      ? 'Próxima: ' +
                        next.title +
                        ' · ' +
                        shortDate.format(new Date(next.startsAt)) +
                        ' · ' +
                        formatTime(next.startsAt)
                      : 'Sin reservas próximas'}
                  </Label>
                </View>
                <View
                  style={{
                    backgroundColor: color.navy,
                    borderRadius: 20,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                  }}
                >
                  <Label role="label" ink="white">
                    Ver ›
                  </Label>
                </View>
              </Tap>
            </Group>
            <Group title="Deportes">
              <Grid columns={3}>
                {(['rugby', 'hockey', 'gimnasio'] as const).map((id) => (
                  <SmallModule key={id} data={data} id={id} />
                ))}
              </Grid>
            </Group>
            <Group title="Actividades">
              {data.activities.map((a) => (
                <Tap
                  key={a.id}
                  label={a.title}
                  href={moduleHref(a.id)}
                  style={[layout.card, layout.row]}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 13,
                      backgroundColor: color.navySoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AppIcon name={modulePresentation[a.id].icon} />
                  </View>
                  <View style={layout.grow}>
                    <Label role="card">{a.title}</Label>
                    <Label role="meta" ink={color.secondaryText}>
                      {a.schedule}
                    </Label>
                  </View>
                  {a.enrollment === 'active' ? (
                    <Pill tone="success">Inscripto</Pill>
                  ) : (
                    <Pill tone="accent">Inscribirme</Pill>
                  )}
                </Tap>
              ))}
            </Group>
            <Group title="Vida en el club">
              <Grid columns={4}>
                {(
                  ['buffet', 'beneficios', 'novedades', 'eventos'] as const
                ).map((id) => (
                  <SmallModule key={id} compact data={data} id={id} />
                ))}
              </Grid>
            </Group>
          </ScrollView>
        );
      }}
    </MemberStage>
  );
}
