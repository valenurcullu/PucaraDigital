import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { memberTheme as theme } from '@pucara/design-tokens';
import { clubDay, selectPersonalEvents } from '@pucara/shared';
import {
  Copy,
  ExperienceScreen,
  Heading,
  NavRow,
} from '../../components/member-ui';
import { EventRows } from '../../features/experience/rows';
export default function Agenda() {
  const [period, setPeriod] = useState<'today' | 'week'>('week');
  return (
    <ExperienceScreen tab>
      {(data) => (
        <>
          <Heading
            title="Tu agenda"
            subtitle="Tus reservas y actividades, en un lugar."
          />
          <View accessibilityRole="radiogroup" style={styles.filters}>
            {(
              [
                { id: 'today', label: 'Hoy' },
                { id: 'week', label: 'Próximos 7 días' },
              ] as const
            ).map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: period === item.id }}
                onPress={() => setPeriod(item.id)}
                style={({ pressed }) => [
                  styles.filter,
                  period === item.id && styles.selected,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    period === item.id && styles.selectedLabel,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <EventRows
            events={selectPersonalEvents(data).filter((event) =>
              period === 'today'
                ? clubDay(new Date(event.startsAt)) ===
                  clubDay(new Date(data.referenceInstant))
                : Date.parse(event.startsAt) <
                  Date.parse(data.referenceInstant) + 7 * 86400000,
            )}
          />
          <Copy muted>
            El gimnasio libre no agrega horarios a tu agenda. Los partidos
            públicos del club se consultan desde Inicio o Deportes.
          </Copy>
          <NavRow title="Explorar actividades y reservas" href="/club" />
        </>
      )}
    </ExperienceScreen>
  );
}
const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm },
  filter: {
    minHeight: theme.touch.minimum,
    justifyContent: 'center',
    padding: theme.space.md,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.color.controlBorder,
    backgroundColor: theme.color.surface,
  },
  selected: {
    backgroundColor: theme.color.navy,
    borderColor: theme.color.navy,
  },
  label: { fontSize: theme.type.body, color: theme.color.text },
  selectedLabel: { color: theme.color.inverseText },
  pressed: { opacity: 0.75 },
});
