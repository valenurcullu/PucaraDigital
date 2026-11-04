import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '@pucara/design-tokens';

export function DemoNotice() {
  return (
    <View style={styles.notice}>
      <Text style={styles.text}>Modo demo · Primera etapa en desarrollo</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  notice: {
    backgroundColor: tokens.color.brandSoft,
    padding: 12,
    borderRadius: tokens.radius.sm,
  },
  text: {
    color: tokens.color.brandDark,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
