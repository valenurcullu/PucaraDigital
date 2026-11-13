import { View } from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { memberTheme as theme } from '@pucara/design-tokens';

const symbols = {
  arrow: { ios: 'arrow.right', android: 'arrow_forward' },
  chevron: { ios: 'chevron.right', android: 'chevron_right' },
  padel: { ios: 'tennis.racket', android: 'sports_tennis' },
  quincho: { ios: 'sun.max', android: 'outdoor_grill' },
  reservations: { ios: 'calendar.badge.clock', android: 'event_available' },
  rugby: { ios: 'american.football', android: 'sports_rugby' },
  hockey: { ios: 'figure.field.hockey', android: 'sports_hockey' },
  gym: { ios: 'dumbbell', android: 'fitness_center' },
  yoga: { ios: 'figure.mind.and.body', android: 'self_improvement' },
  training: { ios: 'figure.strengthtraining.functional', android: 'exercise' },
  buffet: { ios: 'fork.knife', android: 'restaurant' },
  benefits: { ios: 'gift', android: 'redeem' },
  news: { ios: 'megaphone', android: 'campaign' },
  calendar: { ios: 'calendar', android: 'calendar_month' },
  account: { ios: 'doc.text', android: 'receipt_long' },
  family: { ios: 'person.2', android: 'group' },
  person: { ios: 'person.crop.circle', android: 'account_circle' },
  settings: { ios: 'slider.horizontal.3', android: 'tune' },
  help: { ios: 'questionmark.circle', android: 'help_outline' },
  clock: { ios: 'clock', android: 'schedule' },
  location: { ios: 'mappin.and.ellipse', android: 'location_on' },
  credit: { ios: 'ticket', android: 'confirmation_number' },
  info: { ios: 'info.circle', android: 'info' },
  error: { ios: 'exclamationmark.triangle', android: 'error_outline' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle' },
} as const satisfies Record<string, SymbolViewProps['name']>;
export type AppIconName = keyof typeof symbols;

/** Decorative symbols; the containing action/text supplies the accessible name. */
export function AppIcon({
  name,
  size = 24,
  color = theme.color.text,
}: {
  name: AppIconName;
  size?: number;
  color?: string;
}) {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <SymbolView
        name={symbols[name]}
        tintColor={color}
        size={size}
        style={{ width: size, height: size }}
      />
    </View>
  );
}
