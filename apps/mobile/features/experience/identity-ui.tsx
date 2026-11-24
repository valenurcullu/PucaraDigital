import { View, ScrollView, useWindowDimensions } from 'react-native';
import type { MemberIdentity } from '@pucara/shared';
import { color, Label, layout, Tap } from '../../components/handoff-ui';
export function Avatar({
  person,
  size = 44,
}: {
  person: MemberIdentity;
  size?: number;
}) {
  const initials = person.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: { A: color.navy, B: color.action, C: '#3E6A9A' }[
          person.card.sample
        ],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Label role="card" ink="white" style={{ fontSize: size * 0.34 }}>
        {initials}
      </Label>
    </View>
  );
}
export function PersonPicker({
  people,
  owner,
  selected,
  select,
  all = false,
}: {
  people: readonly MemberIdentity[];
  owner: string;
  selected: string;
  select: (id: string) => void;
  all?: boolean;
}) {
  const { fontScale, width } = useWindowDimensions();
  const compact = width < 350 || fontScale > 1.2;
  const options = people.map((p) => ({
    id: p.id,
    label: p.id === owner ? 'Yo' : p.firstName,
    person: p as MemberIdentity | undefined,
  }));
  if (all) options.unshift({ id: 'all', label: 'Todos', person: undefined });
  return (
    <ScrollView
      horizontal
      style={{ flexGrow: 0, flexShrink: 0 }}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6, flexGrow: 1, alignItems: 'center' }}
    >
      {options.map((o) => {
        const active = o.id === selected;
        return (
          <Tap
            key={o.id}
            label={o.label}
            selected={active}
            onPress={() => select(o.id)}
            style={[
              layout.row,
              {
                justifyContent: 'center',
                minHeight: all ? 44 : 48,
                borderRadius: all ? 24 : 14,
                borderWidth: 1,
                borderColor: active ? color.navy : color.hairline,
                paddingHorizontal: all ? 13 : 9,
                gap: 6,
                backgroundColor: active ? color.navy : color.surface,
              },
              !all && !compact && { flex: 1 },
            ]}
          >
            {!all && o.person && (
              <View
                style={{
                  borderRadius: 16,
                  padding: 1,
                  backgroundColor: color.surface,
                }}
              >
                <Avatar person={o.person} size={26} />
              </View>
            )}
            <Label role="label" ink={active ? 'white' : color.text}>
              {o.label}
            </Label>
          </Tap>
        );
      })}
    </ScrollView>
  );
}
export function DemoCaption({
  children = 'Datos de demostración',
}: {
  children?: string;
}) {
  return (
    <Label
      role="meta"
      ink={color.secondaryText}
      style={{ textAlign: 'center' }}
    >
      {children}
    </Label>
  );
}
