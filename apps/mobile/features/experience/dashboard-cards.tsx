import { StyleSheet, Text, View } from 'react-native';
import { RoutePressable } from '../../components/route-pressable';
import { memberTheme as theme } from '@pucara/design-tokens';
import {
  clubTimeZone,
  type ClubMatch,
  type ClubNotice,
  type MemberExperience,
  type PersonalEvent,
} from '@pucara/shared';
import { AppIcon } from '../../components/app-icon';
import { ButtonLink, StatusBadge, TileGrid } from '../../components/member-ui';
import { formatDate, formatTime, moduleHref, targetHref } from './navigation';

const dayLabel = new Intl.DateTimeFormat('es-AR', {
  timeZone: clubTimeZone,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

export function ReservationHub({ data }: { data: MemberExperience }) {
  return (
    <View style={styles.hub}>
      <View style={styles.hubTop}>
        <Text accessibilityRole="header" style={styles.hubTitle}>
          Reservas
        </Text>
        <StatusBadge>
          {data.padel.availableCredits}{' '}
          {data.padel.availableCredits === 1
            ? 'crédito de pádel'
            : 'créditos de pádel'}
        </StatusBadge>
      </View>
      <ButtonLink
        title="Ver turnos de pádel"
        icon="padel"
        href={moduleHref('padel')}
      />
      <TileGrid>
        <ButtonLink
          title="Reservar quincho"
          icon="quincho"
          href={moduleHref('quinchos')}
          variant="secondary"
        />
        <ButtonLink
          title="Mis reservas"
          icon="reservations"
          href={moduleHref('reservas')}
          variant="tonal"
        />
      </TileGrid>
    </View>
  );
}
export function MatchCard({
  match,
  showFixture = true,
}: {
  match: ClubMatch;
  showFixture?: boolean;
}) {
  const sport = match.sport === 'rugby' ? 'Rugby' : 'Hockey';
  return (
    <View style={styles.matchCard}>
      <View
        style={styles.matchBody}
        accessible
        accessibilityLabel={
          sport +
          ', ' +
          match.division +
          '. Pucará contra ' +
          match.opponent +
          '. ' +
          (match.venue === 'home' ? 'Local. ' : 'Visitante. ') +
          formatDate(match.startsAt)
        }
      >
        <View style={styles.sport}>
          <AppIcon name={match.sport} size={23} color={theme.color.action} />
          <Text style={styles.sportLabel}>
            {sport} · {match.division}
          </Text>
        </View>
        <View style={styles.matchTeams}>
          <Text style={styles.team}>Pucará</Text>
          <Text style={styles.versus}>vs.</Text>
          <Text style={styles.opponent}>{match.opponent}</Text>
        </View>
        <View style={styles.matchDate}>
          <Text style={styles.matchDay}>
            {dayLabel.format(new Date(match.startsAt))} ·{' '}
            {formatTime(match.startsAt)} h
          </Text>
          <StatusBadge tone={match.venue === 'home' ? 'accent' : 'neutral'}>
            {match.venue === 'home' ? 'Local' : 'Visitante'}
          </StatusBadge>
        </View>
      </View>
      <View style={styles.matchFooter}>
        <TileGrid>
          <ButtonLink
            title="Ver partido"
            href={targetHref({ kind: 'match', id: match.id })}
            variant="tonal"
          />
          {showFixture && (
            <ButtonLink
              title="Ver fixture"
              href={moduleHref(match.sport)}
              variant="secondary"
              icon="calendar"
            />
          )}
        </TileGrid>
      </View>
    </View>
  );
}
export function NoticeCard({
  notice,
  featured = false,
}: {
  notice: ClubNotice;
  featured?: boolean;
}) {
  return (
    <RoutePressable
      href={targetHref({ kind: 'notice', id: notice.id })}
      accessibilityRole="link"
      accessibilityLabel={
        notice.category +
        '. ' +
        notice.title +
        '. ' +
        notice.summary +
        '. Leer comunicado.'
      }
      style={({ pressed }) => [
        styles.notice,
        featured && styles.featuredNotice,
        pressed && styles.lightPressed,
      ]}
    >
      <View style={styles.noticeTop}>
        <View style={[styles.noticeIcon, featured && styles.featuredIcon]}>
          <AppIcon
            name="news"
            size={23}
            color={featured ? theme.color.inverseText : theme.color.action}
          />
        </View>
        <StatusBadge tone="accent">{notice.category}</StatusBadge>
      </View>
      <Text style={styles.noticeTitle}>{notice.title}</Text>
      <Text style={styles.noticeSummary}>{notice.summary}</Text>
      <View style={styles.readAction}>
        <Text style={styles.readLabel}>Leer comunicado</Text>
        <AppIcon name="arrow" size={17} color={theme.color.action} />
      </View>
    </RoutePressable>
  );
}
export function AgendaCard({
  event,
  showDate = true,
}: {
  event: PersonalEvent;
  showDate?: boolean;
}) {
  const status =
    event.kind === 'reservation'
      ? 'Reserva confirmada'
      : event.kind === 'activity'
        ? 'Clase · inscripto'
        : 'Entrenamiento';
  const hours = formatTime(event.startsAt) + ' – ' + formatTime(event.endsAt);
  return (
    <RoutePressable
      href={targetHref(event.target)}
      accessibilityLabel={[
        event.title,
        formatDate(event.startsAt),
        hours,
        event.location,
        status,
      ].join('. ')}
      style={({ pressed }) => [styles.agenda, pressed && styles.lightPressed]}
    >
      <View style={styles.agendaContent}>
        <Text style={styles.eventTime}>
          {showDate ? dayLabel.format(new Date(event.startsAt)) + ' · ' : ''}
          {hours}
        </Text>
        <Text style={styles.agendaTitle}>{event.title}</Text>
        <Text style={styles.agendaMeta}>
          {event.location} · {status}
        </Text>
      </View>
      <AppIcon name="chevron" size={18} color={theme.color.secondaryText} />
    </RoutePressable>
  );
}
const styles = StyleSheet.create({
  hub: {
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.controlBorder,
    borderRadius: theme.radius.card,
    padding: theme.space.md,
    gap: theme.space.md,
  },
  hubTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.sm,
  },
  hubTitle: {
    color: theme.color.navy,
    fontSize: 24,
    fontWeight: '700',
    flexShrink: 1,
  },
  matchCard: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.card,
    backgroundColor: theme.color.surface,
    overflow: 'hidden',
  },
  matchBody: { padding: theme.space.lg, gap: theme.space.sm, flexGrow: 1 },
  sport: { flexDirection: 'row', alignItems: 'center', gap: theme.space.sm },
  sportLabel: {
    color: theme.color.text,
    fontSize: theme.type.body,
    fontWeight: '700',
    flexShrink: 1,
  },

  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  team: {
    flex: 1,
    color: theme.color.navy,
    fontSize: 24,
    fontWeight: '800',
  },
  versus: { color: theme.color.secondaryText, fontSize: 12 },
  opponent: {
    flex: 1,
    textAlign: 'right',
    color: theme.color.text,
    fontSize: 17,
    fontWeight: '600',
  },
  matchDate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    borderTopWidth: 1,
    borderColor: theme.color.border,
    paddingTop: theme.space.md,
    marginTop: 4,
  },
  matchDay: { color: theme.color.secondaryText, fontSize: 13 },

  readAction: {
    alignSelf: 'flex-start',
    backgroundColor: theme.color.surface,
    borderColor: theme.color.controlBorder,
    borderWidth: 1,
    borderRadius: theme.radius.control,
    paddingHorizontal: 12,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    paddingVertical: 4,
  },
  readLabel: {
    color: theme.color.action,
    fontSize: theme.type.secondary,
    fontWeight: '700',
  },
  matchFooter: { padding: theme.space.md, paddingTop: 0 },
  notice: {
    borderWidth: 1,
    borderColor: theme.color.controlBorder,
    borderRadius: theme.radius.card,
    padding: theme.space.lg,
    backgroundColor: theme.color.surface,
    gap: theme.space.md,
  },
  featuredNotice: {
    backgroundColor: theme.color.actionSoft,
    borderColor: theme.color.controlBorder,
  },
  noticeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    flexWrap: 'wrap',
  },
  noticeIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.actionSoft,
  },
  featuredIcon: { backgroundColor: theme.color.action },
  noticeTitle: { color: theme.color.text, fontSize: 21, fontWeight: '700' },
  noticeSummary: {
    color: theme.color.secondaryText,
    fontSize: theme.type.secondary,
    lineHeight: 22,
  },
  agenda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    padding: theme.space.lg,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.color.controlBorder,
    backgroundColor: theme.color.surface,
  },
  eventTime: {
    color: theme.color.action,
    fontWeight: '700',
    fontSize: theme.type.secondary,
    fontVariant: ['tabular-nums'],
  },
  agendaContent: { flex: 1, minWidth: 0, gap: 4 },
  agendaTitle: {
    fontSize: theme.type.body,
    fontWeight: '700',
    color: theme.color.text,
  },
  agendaMeta: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.color.secondaryText,
  },
  lightPressed: { backgroundColor: theme.color.navySoft },
});
