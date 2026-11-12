import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, type Href } from 'expo-router';
import { memberTheme as theme } from '@pucara/design-tokens';
import type { MemberExperience } from '@pucara/shared';
import { useExperience } from '../features/experience/provider';

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
export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}
export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}
export function Badge({ children }: { children: ReactNode }) {
  return <Text style={styles.badge}>{children}</Text>;
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
        styles.action,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.actionText}>{title}</Text>
    </Pressable>
  );
}
export function NavRow({
  title,
  detail,
  href,
  prominent = false,
}: {
  title: string;
  detail?: string;
  href: Href;
  prominent?: boolean;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={detail ? title + '. ' + detail : title}
        style={({ pressed }) => [
          styles.row,
          prominent && styles.prominent,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.rowContent}>
          <Text style={[styles.rowTitle, prominent && styles.inverse]}>
            {title}
          </Text>
          {detail ? (
            <Text style={[styles.detail, prominent && styles.inverse]}>
              {detail}
            </Text>
          ) : null}
        </View>
        <Text
          accessible={false}
          style={[styles.chevron, prominent && styles.inverse]}
        >
          ›
        </Text>
      </Pressable>
    </Link>
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
    <Card>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      <Copy muted>{description}</Copy>
      {retry ? <Action title="Reintentar" onPress={retry} /> : null}
    </Card>
  );
}
export function MemberScreen({
  children,
  tab = false,
}: {
  children: ReactNode;
  tab?: boolean;
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
        <Badge>PUCARÁ · DEMOSTRACIÓN</Badge>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function ExperienceScreen({
  children,
  tab = false,
}: {
  children: (data: MemberExperience) => ReactNode;
  tab?: boolean;
}) {
  const { state, reload } = useExperience();
  return (
    <MemberScreen tab={tab}>
      {state.status === 'loading' ? (
        <View accessibilityLiveRegion="polite" style={styles.section}>
          <ActivityIndicator color={theme.color.action} />
          <Copy>Cargando tu club…</Copy>
        </View>
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
    padding: theme.space.xl,
    gap: theme.space.xl,
    paddingBottom: theme.space.xxl,
  },
  heading: { gap: theme.space.sm },
  title: {
    fontSize: theme.type.title,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: theme.color.text,
  },
  body: { fontSize: theme.type.body, lineHeight: 25, color: theme.color.text },
  muted: { color: theme.color.secondaryText },
  section: { gap: theme.space.md },
  sectionTitle: {
    fontSize: theme.type.section,
    fontWeight: '600',
    color: theme.color.text,
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
    fontSize: theme.type.caption,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.color.secondaryText,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    padding: theme.space.lg,
    minHeight: theme.touch.minimum,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.card,
    borderColor: theme.color.border,
    borderWidth: 1,
  },
  rowContent: { flex: 1, gap: theme.space.xs },
  rowTitle: {
    fontSize: theme.type.body,
    fontWeight: '600',
    color: theme.color.text,
  },
  detail: {
    fontSize: theme.type.secondary,
    lineHeight: 22,
    color: theme.color.secondaryText,
  },
  chevron: { fontSize: 26, color: theme.color.action },
  prominent: {
    backgroundColor: theme.color.navy,
    borderColor: theme.color.navy,
  },
  inverse: { color: theme.color.inverseText },
  action: {
    minHeight: theme.touch.minimum,
    padding: theme.space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.control,
    backgroundColor: theme.color.action,
  },
  actionText: {
    color: theme.color.inverseText,
    fontSize: theme.type.body,
    fontWeight: '600',
  },
  disabled: { backgroundColor: theme.color.secondaryText },
  pressed: { opacity: 0.75 },
});
