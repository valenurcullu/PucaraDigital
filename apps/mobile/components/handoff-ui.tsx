import { useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Href } from 'expo-router';
import { memberTheme as theme } from '@pucara/design-tokens';
import { RoutePressable } from './route-pressable';
import { AppIcon, type AppIconName } from './app-icon';
import { clubTimeZone } from '@pucara/shared';

export const color = theme.color;
export const layout = StyleSheet.create({
  page: { padding: 16, gap: 22, paddingBottom: 28 },
  group: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  grow: { flex: 1, minWidth: 0 },
  card: {
    backgroundColor: color.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: color.hairline,
    padding: 14,
  },
  tile: { alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' },
  line: { height: 1, backgroundColor: color.subtle },
});
const typography = StyleSheet.create({
  title: { fontSize: 32, fontWeight: '700', letterSpacing: -0.7 },
  greeting: { fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  section: { fontSize: 20, fontWeight: '700' },
  subhead: { fontSize: 18, fontWeight: '700' },
  sheet: { fontSize: 22, fontWeight: '700' },
  card: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 15 },
  meta: { fontSize: 13 },
  label: { fontSize: 12, fontWeight: '600' },
  button: { fontSize: 17, fontWeight: '600' },
  number: {
    fontSize: 24,
    fontFamily: theme.font.semibold,
    fontVariant: ['tabular-nums'],
  },
  day: { fontSize: 26, fontFamily: theme.font.bold },
  smallNumber: { fontSize: 20, fontFamily: theme.font.medium },
});
export function Label({
  children,
  role = 'body',
  ink = color.text,
  style,
}: {
  children: ReactNode;
  role?: keyof typeof typography;
  ink?: string;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      accessibilityRole={
        ['title', 'greeting', 'sheet', 'section', 'subhead'].includes(role)
          ? 'header'
          : undefined
      }
      style={[{ color: ink }, typography[role], style]}
    >
      {children}
    </Text>
  );
}
export function Tap({
  children,
  label,
  href,
  onPress,
  style,
  selected,
  disabled = false,
}: {
  children: ReactNode;
  label: string;
  href?: Href;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
  disabled?: boolean;
}) {
  const state: AccessibilityState = {
    disabled,
    ...(selected !== undefined ? { selected } : {}),
  };
  const surface = ({ pressed }: { pressed: boolean }) => [
    style,
    pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
  ];
  return href ? (
    <RoutePressable href={href} accessibilityLabel={label} style={surface}>
      {children}
    </RoutePressable>
  ) : (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={state}
      disabled={disabled}
      onPress={onPress}
      style={surface}
    >
      {children}
    </Pressable>
  );
}
export function Pill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'accent' | 'blue';
}) {
  const [bg, ink] = {
    neutral: [color.subtle, color.secondaryText],
    success: [color.successBackground, color.success],
    warning: [color.warningBackground, color.warning],
    accent: [color.actionSoft, color.action],
    blue: [color.navySoft, color.navy],
  }[tone] as [string, string];
  return (
    <View
      style={{
        alignSelf: 'center',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: bg,
      }}
    >
      <Label role="label" ink={ink}>
        {children}
      </Label>
    </View>
  );
}
export function Command({
  title,
  onPress,
  variant = 'primary',
  icon,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'navy' | 'danger' | 'outline' | 'quiet';
  icon?: AppIconName;
}) {
  const bg = {
    primary: color.action,
    secondary: color.navySoft,
    navy: color.navy,
    danger: color.error,
    outline: color.surface,
    quiet: 'transparent',
  }[variant];
  const ink =
    variant === 'outline'
      ? color.error
      : variant === 'secondary' || variant === 'quiet'
        ? color.navy
        : color.inverseText;
  return (
    <Tap
      label={title}
      onPress={onPress}
      style={[
        layout.row,
        {
          justifyContent: 'center',
          minHeight: variant === 'secondary' || variant === 'quiet' ? 48 : 56,
          padding: 10,
          borderRadius: 16,
          backgroundColor: bg,
        },
        variant === 'outline' && {
          borderWidth: 1.5,
          borderColor: color.actionBorder,
        },
      ]}
    >
      {icon && <AppIcon name={icon} color={ink} size={21} />}
      <Label
        role="button"
        ink={ink}
        style={{ textAlign: 'center', flexShrink: 1 }}
      >
        {title}
      </Label>
    </Tap>
  );
}
export function Group({
  title,
  action,
  href,
  children,
}: {
  title: string;
  action?: string;
  href?: Href;
  children: ReactNode;
}) {
  return (
    <View style={layout.group}>
      <View style={layout.between}>
        <Label role="section">{title}</Label>
        {action && href && (
          <Tap
            href={href}
            label={action}
            style={{ justifyContent: 'center', minHeight: 44 }}
          >
            <Label role="meta" ink={color.action}>
              {action}
            </Label>
          </Tap>
        )}
      </View>
      {children}
    </View>
  );
}
export function Grid({
  columns,
  children,
}: {
  columns: number;
  children: ReactNode[];
}) {
  const { width, fontScale } = useWindowDimensions();
  const n =
    fontScale > 1.8
      ? 1
      : fontScale > 1.35 || width < 345
        ? Math.min(2, columns)
        : columns;
  const rows = [];
  for (let i = 0; i < children.length; i += n) {
    const cells = children.slice(i, i + n);
    rows.push(
      <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
        {Array.from({ length: n }, (_, j) => (
          <View key={j} style={{ flex: 1, minWidth: 0 }}>
            {cells[j]}
          </View>
        ))}
      </View>,
    );
  }
  return <View style={{ gap: 8 }}>{rows}</View>;
}
const weekday = new Intl.DateTimeFormat('es-AR', {
  timeZone: clubTimeZone,
  weekday: 'short',
});
export const longDate = new Intl.DateTimeFormat('es-AR', {
  timeZone: clubTimeZone,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
export const shortDate = new Intl.DateTimeFormat('es-AR', {
  timeZone: clubTimeZone,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});
export function DateBlock({ instant }: { instant: string }) {
  const d = new Date(instant);
  return (
    <View
      style={{
        minWidth: 48,
        minHeight: 48,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color.background,
        borderRadius: 12,
      }}
    >
      <Label
        role="label"
        ink={color.action}
        style={{ fontSize: 10, textTransform: 'uppercase' }}
      >
        {weekday.format(d).replace('.', '')}
      </Label>
      <Label role="day" style={{ fontSize: 22 }}>
        {new Intl.DateTimeFormat('es-AR', {
          timeZone: clubTimeZone,
          day: 'numeric',
        }).format(d)}
      </Label>
    </View>
  );
}
const grabber = {
  width: 40,
  height: 5,
  alignSelf: 'center',
  backgroundColor: color.border,
  borderRadius: 4,
} as const;

// The drag starts on the handle. Horizontal dates and vertical content keep their own native responders.
function DragSurface({
  children,
  onClose,
}: {
  children: (handle: ReactNode) => ReactNode;
  onClose: () => void;
}) {
  const [offset] = useState(() => new Animated.Value(0));
  const start = useRef(0);
  const restore = () =>
    Animated.spring(offset, {
      toValue: 0,
      useNativeDriver: true,
      overshootClamping: true,
    }).start();
  const handle = (
    <View
      accessible={false}
      style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
      onStartShouldSetResponder={() => true}
      onResponderGrant={(e) => {
        offset.stopAnimation();
        start.current = e.nativeEvent.pageY;
      }}
      onResponderMove={(e) =>
        offset.setValue(Math.max(0, e.nativeEvent.pageY - start.current))
      }
      onResponderRelease={(e) => {
        if (e.nativeEvent.pageY - start.current >= 56) onClose();
        else restore();
      }}
      onResponderTerminate={restore}
    >
      <View pointerEvents="none" style={grabber} />
    </View>
  );
  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        flex: 1,
        justifyContent: 'flex-end',
        transform: [{ translateY: offset }],
      }}
    >
      {children(handle)}
    </Animated.View>
  );
}
export function Sheet({
  title,
  showTitle = true,
  onClose,
  children,
  dismissibleHandle = false,
  footer,
  scrollKey,
}: {
  title: string;
  showTitle?: boolean;
  onClose: () => void;
  children: ReactNode;
  dismissibleHandle?: boolean;
  footer?: ReactNode;
  scrollKey?: string;
}) {
  const content = (handle?: ReactNode) => (
    <SafeAreaView
      accessibilityLabel={title}
      accessibilityViewIsModal
      onAccessibilityEscape={onClose}
      edges={['bottom', 'left', 'right']}
      style={{
        maxHeight: '88%',
        backgroundColor: color.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
      }}
    >
      {handle}
      <ScrollView
        key={scrollKey}
        bounces={false}
        style={{ flexShrink: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: handle ? 0 : 8,
          paddingBottom: 20,
          gap: 16,
        }}
      >
        {!handle && <View style={grabber} />}
        {showTitle && <Label role="sheet">{title}</Label>}
        {children}
      </ScrollView>
      {footer && (
        <View
          style={{
            flexShrink: 0,
            borderTopWidth: 1,
            borderColor: color.hairline,
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          {footer}
        </View>
      )}
    </SafeAreaView>
  );
  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: color.scrim,
        }}
      >
        <Pressable
          accessibilityLabel="Cerrar hoja"
          accessibilityRole="button"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        {dismissibleHandle ? (
          <DragSurface onClose={onClose}>{content}</DragSurface>
        ) : (
          content()
        )}
      </View>
    </Modal>
  );
}
