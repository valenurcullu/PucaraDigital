import { useMemo } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { memberTheme as theme } from '@pucara/design-tokens';
import { clubDay, offsetClubDay, type MemberExperience } from '@pucara/shared';
import {
  Action,
  ButtonLink,
  Heading,
  Section,
} from '../../components/member-ui';
import { DateStrip } from '../../components/date-strip';
import {
  calendarMonth,
  dayLabels,
  personalWeek,
  mondayOf,
  weekOf,
} from './calendar';
import { EventRows } from './rows';
export function WeekCalendar({
  data,
  day,
  select,
}: {
  data: MemberExperience;
  day: string;
  select: (day: string) => void;
}) {
  const monday = mondayOf(day);
  const days = useMemo(() => weekOf(monday), [monday]);
  const byDay = useMemo(() => personalWeek(data, days), [data, days]);
  const marked = new Set(days.filter((date) => byDay.get(date)?.length));
  return (
    <>
      <Heading title="Mi agenda" />
      <View style={styles.calendar}>
        <Text accessibilityRole="header" style={styles.month}>
          {calendarMonth(day)}
        </Text>
        <View style={styles.controls}>
          <Action
            title="Anterior"
            accessibilityLabel="Semana anterior"
            variant="secondary"
            onPress={() => select(offsetClubDay(day, -7))}
          />
          <Action
            title="Hoy"
            variant="tonal"
            onPress={() => select(clubDay(new Date()))}
          />
          <Action
            title="Siguiente"
            accessibilityLabel="Semana siguiente"
            variant="secondary"
            onPress={() => select(offsetClubDay(day, 7))}
          />
        </View>
        <DateStrip
          days={days}
          selected={day}
          onSelect={select}
          marked={marked}
        />
      </View>
      <Section title={dayLabels(day).full}>
        <EventRows events={byDay.get(day) ?? []} showDate={false} />
      </Section>
      <ButtonLink
        title="Explorar actividades y reservas"
        href="/club"
        variant="secondary"
        icon="calendar"
      />
    </>
  );
}
const styles = StyleSheet.create({
  calendar: { gap: theme.space.md },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm },
  month: {
    fontSize: theme.type.section,
    color: theme.color.navy,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
