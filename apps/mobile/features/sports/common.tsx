import { View } from 'react-native';
import type { ReactNode } from 'react';
import { Tap, Label, color, layout } from '../../components/handoff-ui';
export function Segments({
  values,
  selected,
  onSelect,
}: {
  values: readonly { id: string; title: string }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View
      style={[
        layout.row,
        {
          gap: 2,
          backgroundColor: color.subtle,
          borderRadius: 14,
          padding: 3,
          flexWrap: 'wrap',
        },
      ]}
    >
      {values.map((v) => (
        <Tap
          key={v.id}
          label={v.title}
          selected={selected === v.id}
          onPress={() => onSelect(v.id)}
          style={{
            flex: 1,
            minWidth: 90,
            minHeight: 44,
            padding: 8,
            borderRadius: 11,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selected === v.id ? color.surface : 'transparent',
          }}
        >
          <Label role="card">{v.title}</Label>
        </Tap>
      ))}
    </View>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{ padding: 12, borderRadius: 14, backgroundColor: color.navySoft }}
    >
      <Label role="meta">{children}</Label>
    </View>
  );
}
