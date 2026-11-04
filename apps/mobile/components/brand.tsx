import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '@pucara/design-tokens';

export function Brand() {
  return (
    <View style={styles.row} accessible accessibilityLabel="Pucará Digital">
      <View style={styles.mark}>
        <Text style={styles.letter}>P</Text>
      </View>
      <View>
        <Text style={styles.name}>PUCARÁ</Text>
        <Text style={styles.digital}>DIGITAL</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  mark: {
    backgroundColor: tokens.color.brand,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  letter: { color: tokens.color.surface, fontSize: 30, fontWeight: '700' },
  name: {
    color: tokens.color.ink,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  digital: {
    color: tokens.color.muted,
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 3,
  },
});
