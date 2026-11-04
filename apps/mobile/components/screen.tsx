import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '@pucara/design-tokens';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: tokens.color.canvas },
  content: {
    flexGrow: 1,
    padding: tokens.space.lg,
    gap: tokens.space.lg,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
});
