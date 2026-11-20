import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
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
import {
  formatDate,
  formatMoney,
  formatTime,
  moduleHref,
  targetHref,
} from './navigation';

const dayNumber = new Intl.DateTimeFormat('es-AR', {
  timeZone: clubTimeZone,
  day: '2-digit',
});
const monthName = new Intl.DateTimeFormat('es-AR', {
  timeZone: clubTimeZone,
  month: 'short',
});
const dayLabel = new Intl.DateTimeFormat('es-AR', {
  timeZone: clubTimeZone,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

export function ReservationHub({ data }: { data: MemberExperience }) {
  const count = data.reservations.filter(
    (r) => r.status !== 'cancelled',
  ).length;
  return (
    <View style={styles.hub}>
      <View style={styles.hubTop}>
        <Text accessibilityRole="header" style={styles.hubTitle}>
          Reservá tu lugar
        </Text>
        <StatusBadge tone="inverse">
          {data.padel.availableCredits}{' '}
          {data.padel.availableCredits === 1 ? 'crédito' : 'créditos'} · demo
        </StatusBadge>
      </View>
      <Text style={styles.hubDetail}>
        Pádel · {data.padel.durationMinutes} min ·{' '}
        {formatMoney(data.padel.priceMinor)}
      </Text>
      <TileGrid>
        <ButtonLink
          title="Ver turnos de pádel"
          href={moduleHref('padel')}
          icon="padel"
        />
        <ButtonLink
          title="Reservar quincho"
          href={moduleHref('quinchos')}
          variant="inverse"
          icon="quincho"
        />
      </TileGrid>
      <Link href={moduleHref('reservas')} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={
            'Ver mis reservas. ' + count + ' reservas de demostración'
          }
          style={({ pressed }) => [
            styles.myReservations,
            pressed && styles.hubPressed,
          ]}
        >
          <AppIcon
            name="reservations"
            size={20}
            color={theme.color.inverseText}
          />
          <Text style={styles.myReservationsLabel}>Ver mis reservas</Text>
          <View style={styles.count}>
            <Text style={styles.countText}>{count}</Text>
          </View>
          <AppIcon name="chevron" size={17} color={theme.color.inverseText} />
        </Pressable>
      </Link>
      <Text style={styles.demo}>Vista demo · sin reservas reales</Text>
    </View>
  );
}
export function MatchCard({ match }: { match: ClubMatch }) {
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
            variant="secondary"
          />
          <ButtonLink
            title="Ver fixture"
            href={moduleHref(match.sport)}
            variant="secondary"
            icon="calendar"
          />
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
    <Link href={targetHref({ kind: 'notice', id: notice.id })} asChild>
      <Pressable
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
      </Pressable>
    </Link>
  );
}
export function AgendaCard({ event }: { event: PersonalEvent }) {
  const date = new Date(event.startsAt);
  return (
    <Link href={targetHref(event.target)} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={
          event.title +
          '. ' +
          formatDate(event.startsAt) +
          '. ' +
          event.location
        }
        style={({ pressed }) => [styles.agenda, pressed && styles.lightPressed]}
      >
        <View style={styles.dateBlock} accessible={false}>
          <Text style={styles.dateNumber}>{dayNumber.format(date)}</Text>
          <Text style={styles.dateMonth}>
            {monthName.format(date).replace('.', '').toUpperCase()}
          </Text>
        </View>
        <View style={styles.agendaContent}>
          <Text style={styles.agendaTitle}>{event.title}</Text>
          <Text style={styles.agendaMeta}>
            {formatTime(event.startsAt)} h · {event.location}
          </Text>
          <Text style={styles.agendaStatus}>
            {event.kind === 'reservation'
              ? 'Reserva confirmada · demo'
              : event.kind === 'activity'
                ? 'Inscripción activa · demo'
                : 'Entrenamiento · demo'}
          </Text>
        </View>
        <AppIcon name="chevron" size={18} color={theme.color.secondaryText} />
      </Pressable>
    </Link>
  );
}
const styles = StyleSheet.create({
  hub: {
    backgroundColor: theme.color.navy,
    borderRadius: 24,
    padding: 20,
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
    color: theme.color.inverseText,
    fontSize: 24,
    fontWeight: '700',
    flexShrink: 1,
  },
  hubDetail: {
    color: theme.color.onDarkMuted,
    fontSize: theme.type.secondary,
    lineHeight: 22,
  },
  myReservations: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  myReservationsLabel: {
    color: theme.color.inverseText,
    fontSize: theme.type.secondary,
    fontWeight: '700',
    flex: 1,
  },
  count: {
    backgroundColor: theme.color.navyPressed,
    borderRadius: 10,
    minWidth: 26,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: 'center',
  },
  countText: {
    color: theme.color.inverseText,
    fontSize: 13,
    fontWeight: '700',
  },
  hubPressed: { backgroundColor: theme.color.navyPressed },
  demo: { color: theme.color.onDarkMuted, fontSize: theme.type.caption },
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
    borderColor: theme.color.border,
    borderRadius: theme.radius.card,
    padding: 20,
    backgroundColor: theme.color.surface,
    gap: theme.space.md,
  },
  featuredNotice: {
    backgroundColor: theme.color.actionSoft,
    borderColor: theme.color.actionBorder,
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
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
  },
  dateBlock: {
    minWidth: 50,
    borderRadius: 13,
    padding: 8,
    alignItems: 'center',
    backgroundColor: theme.color.navySoft,
  },
  dateNumber: { fontSize: 25, fontWeight: '800', color: theme.color.navy },
  dateMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.color.secondaryText,
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
  agendaStatus: { fontSize: 12, lineHeight: 18, color: theme.color.success },
  lightPressed: { backgroundColor: theme.color.navySoft },
});
