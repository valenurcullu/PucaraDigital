import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, type Href } from 'expo-router';
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
    <Link href={href} asChild>
      <Pressable
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
              size={26}
              color={accent ? theme.color.action : theme.color.navy}
            />
          </View>
          <AppIcon name="chevron" size={17} color={theme.color.secondaryText} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {detail ? <Text style={styles.detail}>{detail}</Text> : null}
          {badge ? <StatusBadge tone="positive">{badge}</StatusBadge> : null}
        </View>
        <Text style={styles.action}>{action}</Text>
      </Pressable>
    </Link>
  );
}
const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    minHeight: 156,
    padding: theme.space.lg,
    gap: theme.space.md,
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.card,
  },
  accent: {
    backgroundColor: theme.color.actionSoft,
    borderColor: theme.color.actionBorder,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.space.sm,
  },
  iconWell: {
    width: 46,
    height: 46,
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
  action: {
    fontSize: theme.type.secondary,
    fontWeight: '700',
    color: theme.color.action,
  },
  pressed: {
    backgroundColor: theme.color.navySoft,
    borderColor: theme.color.action,
  },
});
