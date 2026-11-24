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
import { clubDay } from '@pucara/shared';
const gap = 0;

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
    fontScale > 1.3 ? Math.ceil(38 * fontScale) : 32,
    Math.floor(width / days.length),
  );
  const today = clubDay(new Date());
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
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[styles.weekday, { color: theme.color.secondaryText }]}
            >
              {labels.weekday.slice(0, 1).toUpperCase()}
            </Text>
            <View
              style={{
                minWidth: Math.min(cell, 38 * fontScale),
                minHeight: 38 * fontScale,
                borderRadius: 100,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: checked ? theme.color.navy : 'transparent',
              }}
            >
              <Text
                style={[
                  styles.number,
                  {
                    color: checked
                      ? 'white'
                      : day === today
                        ? theme.color.action
                        : day < today
                          ? theme.color.secondaryText
                          : theme.color.text,
                  },
                ]}
              >
                {labels.number}
              </Text>
            </View>
            {marked && (
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: hasEvents
                      ? theme.color.action
                      : 'transparent',
                  },
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

    minHeight: theme.touch.minimum,
  },
  weekday: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  number: { fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'] },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
});
