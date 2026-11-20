import { StyleSheet, Text, View } from 'react-native';
import type { Href } from 'expo-router';
import { RoutePressable } from './route-pressable';
import { memberTheme as theme } from '@pucara/design-tokens';
import { AppIcon, type AppIconName } from './app-icon';
import { StatusBadge } from './member-ui';

export function ActionCard({
  title,
  action,
  icon,
  href,
  detail,
  badge,
  accent = false,
}: {
  title: string;
  action: string;
  icon: AppIconName;
  href: Href;
  detail?: string;
  badge?: string;
  accent?: boolean;
}) {
  return (
    <RoutePressable
      href={href}
      accessibilityRole="link"
      accessibilityLabel={[title, detail, badge, action]
        .filter(Boolean)
        .join('. ')}
      style={({ pressed }) => [
        styles.card,
        accent && styles.accent,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.iconWell, accent && styles.accentWell]}>
          <AppIcon
            name={icon}
            size={21}
            color={accent ? theme.color.action : theme.color.navy}
          />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
        {badge ? <StatusBadge tone="positive">{badge}</StatusBadge> : null}
      </View>
      <View style={styles.actionBar}>
        <Text style={styles.action}>{action}</Text>
        <AppIcon name="chevron" size={15} color={theme.color.navy} />
      </View>
    </RoutePressable>
  );
}
const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    minHeight: 108,
    padding: theme.space.md,
    gap: theme.space.sm,
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.controlBorder,
    borderRadius: theme.radius.card,
  },
  accent: {
    backgroundColor: theme.color.actionSoft,
    borderColor: theme.color.controlBorder,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.space.sm,
  },
  iconWell: {
    width: 34,
    height: 34,
    borderRadius: 15,
    backgroundColor: theme.color.navySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accentWell: { backgroundColor: theme.color.surface },
  content: { gap: 6, flexGrow: 1 },
  title: { fontSize: 18, fontWeight: '700', color: theme.color.text },
  detail: {
    fontSize: theme.type.secondary,
    lineHeight: 21,
    color: theme.color.secondaryText,
  },
  actionBar: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    backgroundColor: theme.color.navySoft,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  action: {
    flexShrink: 1,
    fontSize: theme.type.secondary,
    fontWeight: '700',
    color: theme.color.navy,
  },
  pressed: {
    backgroundColor: theme.color.navySoft,
    borderColor: theme.color.action,
  },
});
