import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '@pucara/design-tokens';
import { requireDemoMode } from '@pucara/shared';
import { Screen } from '../components/screen';
import { Brand } from '../components/brand';
import { DemoNotice } from '../components/demo-notice';

export default function HomeScreen() {
  requireDemoMode(process.env.EXPO_PUBLIC_DATA_MODE);
  return (
    <Screen>
      <Brand />
      <DemoNotice />
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>BIENVENIDO A TU CLUB</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Tu club,{'\n'}
          <Text style={styles.accent}>más cerca.</Text>
        </Text>
        <Text style={styles.body}>
          Hay cosas que nos unen. Una camiseta, un equipo, un lugar al que
          siempre queremos volver.
        </Text>
        <Link href="/experiencia" asChild>
          <Pressable
            accessibilityRole="link"
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonLabel}>Conocé la experiencia</Text>
            <Text style={styles.buttonArrow} aria-hidden>
              ↗
            </Text>
          </Pressable>
        </Link>
        <Text style={styles.caption}>
          Una primera mirada a lo que estamos construyendo.
        </Text>
      </View>
      <View style={styles.community}>
        <Text style={styles.communityLabel}>
          PERTENECER SE VIVE TODOS LOS DÍAS
        </Text>
        <Text style={styles.communityTitle}>
          En la cancha.{'\n'}En la tribuna.{'\n'}En cada encuentro.
        </Text>
        <Text style={styles.communityFoot}>
          El mismo club. Una nueva forma de estar cerca.
        </Text>
      </View>
      <Text style={styles.footer}>
        Pucará Digital · Desarrollado por Suplio
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  hero: { gap: 20, paddingVertical: 16 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: tokens.color.brand,
  },
  title: {
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '600',
    letterSpacing: -2,
    color: tokens.color.ink,
  },
  accent: { color: tokens.color.brand },
  body: { fontSize: 17, lineHeight: 28, color: tokens.color.muted },
  button: {
    backgroundColor: tokens.color.brand,
    borderRadius: tokens.radius.sm,
    padding: 18,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pressed: { backgroundColor: tokens.color.brandDark },
  buttonLabel: {
    color: tokens.color.surface,
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  buttonArrow: { color: tokens.color.surface, fontSize: 20 },
  caption: { color: tokens.color.muted, fontSize: 12, lineHeight: 19 },
  community: {
    backgroundColor: tokens.color.brand,
    padding: 28,
    borderRadius: 4,
    borderTopRightRadius: 48,
    gap: 26,
  },
  communityLabel: {
    color: tokens.color.surface,
    fontSize: 10,
    lineHeight: 17,
    letterSpacing: 1.5,
  },
  communityTitle: {
    color: tokens.color.surface,
    fontSize: 32,
    lineHeight: 42,
    fontWeight: '500',
  },
  communityFoot: { color: tokens.color.surface, fontSize: 12, lineHeight: 20 },
  footer: {
    color: tokens.color.muted,
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
