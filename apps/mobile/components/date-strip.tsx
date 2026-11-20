import { useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { memberTheme as theme } from '@pucara/design-tokens';
import { dayLabels } from '../features/experience/calendar';
import { controlColors } from './control-colors';
const gap = theme.space.xs;

export function DateStrip({
  days,
  selected,
  onSelect,
  marked,
}: {
  days: readonly string[];
  selected: string;
  onSelect: (day: string) => void;
  marked?: ReadonlySet<string>;
}) {
  const [width, setWidth] = useState(0);
  const { fontScale } = useWindowDimensions();
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  const cell = Math.max(
    44,
    Math.ceil(38 * fontScale),
    Math.floor((width - gap * (days.length - 1)) / days.length),
  );
  const index = days.indexOf(selected);
  useEffect(() => {
    if (width)
      ref.current?.scrollTo({
        x: Math.max(0, index * (cell + gap) - (width - cell) / 2),
        animated: false,
      });
  }, [index, width, cell]);
  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      contentContainerStyle={{ gap }}
      accessibilityRole="radiogroup"
    >
      {days.map((day) => {
        const labels = dayLabels(day);
        const checked = day === selected;
        const hasEvents = marked?.has(day);
        const colors = checked
          ? controlColors.selected
          : controlColors.secondary;
        return (
          <Pressable
            key={day}
            accessibilityRole="radio"
            accessibilityState={{ checked }}
            accessibilityLabel={
              labels.full + (hasEvents ? ', con compromisos' : '')
            }
            onPress={() => onSelect(day)}
            style={({ pressed }) => [
              styles.cell,
              {
                width: cell,
                borderColor: colors.border,
                backgroundColor: pressed ? colors.pressed : colors.fill,
              },
            ]}
          >
            <Text style={[styles.weekday, { color: colors.ink }]}>
              {labels.weekday.replace('.', '')}
            </Text>
            <Text style={[styles.number, { color: colors.ink }]}>
              {labels.number}
            </Text>
            {marked && (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: hasEvents ? colors.ink : 'transparent' },
                ]}
              />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: theme.touch.minimum,
  },
  weekday: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  number: { fontSize: 19, fontWeight: '700', fontVariant: ['tabular-nums'] },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
});
