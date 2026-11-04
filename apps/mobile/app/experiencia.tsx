import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '@pucara/design-tokens';
import { plannedExperience } from '@pucara/shared';
import { Screen } from '../components/screen';
import { DemoNotice } from '../components/demo-notice';

export default function ExperienceScreen() {
  return (
    <Screen>
      <Link href="/" dismissTo asChild>
        <Pressable accessibilityRole="link" style={styles.back}>
          <Text style={styles.backLabel}>← Volver al inicio</Text>
        </Pressable>
      </Link>
      <DemoNotice />
      <Text style={styles.eyebrow}>LO QUE VIENE</Text>
      <Text accessibilityRole="header" style={styles.title}>
        Tu vida en el club.{'\n'}
        <Text style={styles.accent}>A tu manera.</Text>
      </Text>
      <Text style={styles.body}>
        Cinco espacios para que lo cotidiano sea más simple. Esta es la
        estructura que estamos preparando para vos.
      </Text>
      <View>
        {plannedExperience.map((item) => (
          <View key={item.key} style={styles.row}>
            <Text style={styles.number}>{item.number}</Text>
            <View style={styles.rowContent}>
              <Text accessibilityRole="header" style={styles.rowTitle}>
                {item.name}
              </Text>
              <Text style={styles.summary}>{item.summary}</Text>
              <Text style={styles.body}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.note}>
        Vista previa informativa. Estas secciones están en desarrollo y todavía
        no permiten consultar datos de socios ni realizar operaciones.
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  backLabel: {
    color: tokens.color.brand,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: tokens.color.brand,
    marginTop: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: '600',
    letterSpacing: -1.5,
    color: tokens.color.ink,
  },
  accent: { color: tokens.color.brand },
  body: { fontSize: 16, lineHeight: 26, color: tokens.color.muted },
  row: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 28,
    borderTopWidth: 1,
    borderTopColor: tokens.color.line,
  },
  number: { fontSize: 12, color: tokens.color.brand, paddingTop: 5 },
  rowContent: { flex: 1, gap: 10 },
  rowTitle: { fontSize: 25, color: tokens.color.ink, fontWeight: '500' },
  summary: { fontSize: 13, color: tokens.color.brand },
  note: {
    fontSize: 13,
    lineHeight: 22,
    color: tokens.color.muted,
    borderTopWidth: 1,
    borderTopColor: tokens.color.line,
    paddingTop: 24,
  },
});
