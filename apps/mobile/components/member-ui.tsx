import { Children, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, type Href } from 'expo-router';
import { memberTheme as theme } from '@pucara/design-tokens';
import type { MemberExperience } from '@pucara/shared';
import { useExperience } from '../features/experience/provider';
import { AppIcon, type AppIconName } from './app-icon';

export function Copy({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return <Text style={[styles.body, muted && styles.muted]}>{children}</Text>;
}
export function Heading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.heading}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {subtitle ? <Copy muted>{subtitle}</Copy> : null}
    </View>
  );
}
export function AppHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.appHeader}>
      <View style={styles.brandRow}>
        <View style={styles.brandLabel}>
          <Text style={styles.wordmark}>PUCARÁ</Text>
          <StatusBadge tone="accent">DEMO</StatusBadge>
        </View>
        <Link href="/cuenta" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir mi cuenta"
            style={({ pressed }) => [
              styles.avatar,
              pressed && styles.softPressed,
            ]}
          >
            <AppIcon name="person" size={27} />
          </Pressable>
        </Link>
      </View>
      <Heading title={title} subtitle={subtitle} />
    </View>
  );
}
type SectionAction = { title: string; href: Href };
export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: SectionAction;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {action ? (
        <Link href={action.href} asChild>
          <Pressable
            accessibilityRole="link"
            style={({ pressed }) => [
              styles.sectionAction,
              pressed && styles.softPressed,
            ]}
          >
            <Text style={styles.sectionActionText}>{action.title}</Text>
            <AppIcon name="arrow" size={16} color={theme.color.action} />
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
}
export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: SectionAction;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} {...(action ? { action } : {})} />
      {children}
    </View>
  );
}
export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}
type BadgeTone = 'neutral' | 'accent' | 'positive' | 'inverse' | 'danger';
export function StatusBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <View style={[styles.badge, badgeStyles[tone]]}>
      <Text style={[styles.badgeText, badgeTextStyles[tone]]}>{children}</Text>
    </View>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return <StatusBadge>{children}</StatusBadge>;
}
export function DemoNotice() {
  return (
    <View style={styles.demoNotice}>
      <AppIcon name="info" size={16} color={theme.color.secondaryText} />
      <Text style={styles.detail}>Modo demo · datos ficticios</Text>
    </View>
  );
}
type ButtonVariant = 'primary' | 'secondary' | 'inverse';
export function ButtonLink({
  title,
  href,
  variant = 'primary',
  icon = 'arrow',
}: {
  title: string;
  href: Href;
  variant?: ButtonVariant;
  icon?: AppIconName;
}) {
  const color =
    variant === 'primary'
      ? theme.color.inverseText
      : variant === 'inverse'
        ? theme.color.inverseText
        : theme.color.text;
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={title}
        style={({ pressed }) => [
          styles.button,
          buttonStyles[variant],
          pressed &&
            (variant === 'primary'
              ? styles.primaryPressed
              : styles.buttonPressed),
        ]}
      >
        <Text style={[styles.buttonText, { color }]}>{title}</Text>
        <AppIcon name={icon} size={20} color={color} />
      </Pressable>
    </Link>
  );
}
export function Action({
  title,
  onPress,
  disabled = false,
}: {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        buttonStyles.primary,
        disabled && styles.disabled,
        pressed && styles.primaryPressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: disabled
              ? theme.color.secondaryText
              : theme.color.inverseText,
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function NavRow({
  title,
  detail,
  href,
  prominent = false,
  icon = 'arrow',
}: {
  title: string;
  detail?: string;
  href: Href;
  prominent?: boolean;
  icon?: AppIconName;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={detail ? title + '. ' + detail : title}
        style={({ pressed }) => [
          styles.row,
          prominent && styles.prominent,
          pressed && (prominent ? styles.darkPressed : styles.softPressed),
        ]}
      >
        <View style={[styles.iconWell, prominent && styles.iconWellInverse]}>
          <AppIcon
            name={icon}
            size={22}
            color={prominent ? theme.color.inverseText : theme.color.action}
          />
        </View>
        <View style={styles.rowContent}>
          <Text style={[styles.rowTitle, prominent && styles.inverse]}>
            {title}
          </Text>
          {detail ? (
            <Text style={[styles.detail, prominent && styles.inverseMuted]}>
              {detail}
            </Text>
          ) : null}
        </View>
        <AppIcon
          name="chevron"
          size={18}
          color={
            prominent ? theme.color.inverseText : theme.color.secondaryText
          }
        />
      </Pressable>
    </Link>
  );
}
export function TileGrid({
  children,
  minColumnWidth = 145,
}: {
  children: ReactNode;
  minColumnWidth?: number;
}) {
  const { width, fontScale } = useWindowDimensions();
  const singleColumn =
    Math.min(width, 760) - 40 < minColumnWidth * 2 + theme.space.md ||
    fontScale > 1.35;
  return (
    <View style={styles.grid}>
      {Children.map(children, (child) => (
        <View style={[styles.gridItem, singleColumn && styles.gridSingle]}>
          {child}
        </View>
      ))}
    </View>
  );
}
export function StateView({
  title,
  description,
  retry,
}: {
  title: string;
  description: string;
  retry?: () => void;
}) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.state, retry && styles.errorState]}
    >
      <View style={[styles.stateIcon, retry && styles.errorIcon]}>
        <AppIcon
          name={retry ? 'error' : 'calendar'}
          size={28}
          color={retry ? theme.color.error : theme.color.secondaryText}
        />
      </View>
      <Text accessibilityRole="header" style={styles.stateTitle}>
        {title}
      </Text>
      <Copy muted>{description}</Copy>
      {retry ? <Action title="Volver a intentar" onPress={retry} /> : null}
    </View>
  );
}
function LoadingState() {
  return (
    <View accessibilityLiveRegion="polite" style={styles.state}>
      <View style={styles.loadingHeading}>
        <ActivityIndicator color={theme.color.action} />
        <Text style={styles.rowTitle}>Preparando tu club</Text>
      </View>
      <Copy muted>Un momento, estamos cargando tu información.</Copy>
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.skeletonGroup}
      >
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonLine} />
      </View>
    </View>
  );
}
export function MemberScreen({
  children,
  tab = false,
  showDemoNotice = true,
}: {
  children: ReactNode;
  tab?: boolean;
  showDemoNotice?: boolean;
}) {
  return (
    <SafeAreaView
      style={styles.safe}
      edges={
        tab
          ? Platform.OS === 'ios'
            ? ['left', 'right']
            : ['top', 'left', 'right']
          : ['left', 'right', 'bottom']
      }
    >
      <ScrollView
        contentInsetAdjustmentBehavior={tab ? 'automatic' : 'never'}
        contentContainerStyle={styles.content}
      >
        {showDemoNotice ? <DemoNotice /> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function ExperienceScreen({
  children,
  tab = false,
  showDemoNotice = true,
}: {
  children: (data: MemberExperience) => ReactNode;
  tab?: boolean;
  showDemoNotice?: boolean;
}) {
  const { state, reload } = useExperience();
  return (
    <MemberScreen tab={tab} showDemoNotice={showDemoNotice}>
      {state.status === 'loading' ? (
        <LoadingState />
      ) : state.status === 'error' ? (
        <StateView
          title="No pudimos cargar tu club"
          description={state.message}
          retry={reload}
        />
      ) : (
        children(state.data)
      )}
    </MemberScreen>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.color.background },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: 20,
    gap: theme.space.xl,
    paddingBottom: theme.space.xxl,
  },
  appHeader: { gap: theme.space.lg },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.md,
  },
  brandLabel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    flex: 1,
    gap: theme.space.md,
  },
  wordmark: {
    color: theme.color.navy,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
  },
  heading: { gap: 6 },
  title: {
    fontSize: theme.type.title,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: theme.color.text,
  },
  body: { fontSize: theme.type.body, lineHeight: 24, color: theme.color.text },
  muted: { color: theme.color.secondaryText },
  section: { gap: theme.space.md },
  sectionHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: theme.space.md,
  },
  sectionTitle: {
    fontSize: theme.type.section,
    fontWeight: '700',
    color: theme.color.text,
    flexShrink: 1,
  },
  sectionAction: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  sectionActionText: {
    fontSize: theme.type.secondary,
    fontWeight: '700',
    color: theme.color.action,
  },
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.card,
    padding: theme.space.lg,
    gap: theme.space.md,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '100%',
  },
  badgeText: {
    fontSize: theme.type.caption,
    fontWeight: '700',
    lineHeight: 17,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.sm,
  },
  button: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space.sm,
    paddingHorizontal: theme.space.lg,
    paddingVertical: 14,
    borderRadius: theme.radius.control,
    borderWidth: 1,
  },
  buttonText: { fontSize: theme.type.body, fontWeight: '700', flexShrink: 1 },
  disabled: {
    backgroundColor: theme.color.subtle,
    borderColor: theme.color.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    padding: theme.space.lg,
    minHeight: 72,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.card,
    borderColor: theme.color.border,
    borderWidth: 1,
  },
  iconWell: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: theme.color.actionSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWellInverse: { backgroundColor: theme.color.navyPressed },
  rowContent: { flex: 1, minWidth: 0, gap: theme.space.xs },
  rowTitle: {
    fontSize: theme.type.body,
    fontWeight: '700',
    color: theme.color.text,
  },
  detail: {
    fontSize: theme.type.secondary,
    lineHeight: 21,
    color: theme.color.secondaryText,
    flexShrink: 1,
  },
  prominent: {
    backgroundColor: theme.color.navy,
    borderColor: theme.color.navy,
  },
  inverse: { color: theme.color.inverseText },
  inverseMuted: { color: theme.color.onDarkMuted },
  softPressed: {
    backgroundColor: theme.color.navySoft,
    borderColor: theme.color.controlBorder,
  },
  darkPressed: { backgroundColor: theme.color.navyPressed },
  primaryPressed: { backgroundColor: theme.color.actionPressed },
  buttonPressed: { opacity: 0.7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.md },
  gridItem: { flexBasis: '47%', flexGrow: 1, minWidth: 0 },
  gridSingle: { flexBasis: '100%' },
  state: {
    gap: theme.space.md,
    padding: theme.space.xl,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.color.border,
    backgroundColor: theme.color.surface,
  },
  errorState: { borderColor: theme.color.error },
  stateIcon: {
    width: 56,
    height: 56,
    backgroundColor: theme.color.navySoft,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: { backgroundColor: theme.color.errorBackground },
  stateTitle: { fontSize: 20, fontWeight: '700', color: theme.color.text },
  loadingHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
  },
  skeletonGroup: { gap: theme.space.md },
  skeletonTitle: {
    height: 18,
    width: '65%',
    borderRadius: 8,
    backgroundColor: theme.color.subtle,
  },
  skeletonCard: {
    height: 96,
    borderRadius: 14,
    backgroundColor: theme.color.subtle,
  },
  skeletonLine: {
    height: 14,
    width: '85%',
    borderRadius: 7,
    backgroundColor: theme.color.subtle,
  },
});
const badgeStyles = StyleSheet.create({
  neutral: { backgroundColor: theme.color.navySoft },
  accent: { backgroundColor: theme.color.actionSoft },
  positive: { backgroundColor: theme.color.successBackground },
  inverse: { backgroundColor: theme.color.navyPressed },
  danger: { backgroundColor: theme.color.errorBackground },
});
const badgeTextStyles = StyleSheet.create({
  neutral: { color: theme.color.secondaryText },
  accent: { color: theme.color.action },
  positive: { color: theme.color.success },
  inverse: { color: theme.color.inverseText },
  danger: { color: theme.color.error },
});
const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: theme.color.action,
    borderColor: theme.color.action,
  },
  secondary: {
    backgroundColor: theme.color.surface,
    borderColor: theme.color.controlBorder,
  },
  inverse: {
    backgroundColor: theme.color.navy,
    borderColor: theme.color.inverseBorder,
  },
});
