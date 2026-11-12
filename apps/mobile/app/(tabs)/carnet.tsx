import { StyleSheet, Text, View } from 'react-native';
import { memberTheme as theme } from '@pucara/design-tokens';
import {
  Badge,
  Card,
  Copy,
  ExperienceScreen,
  Heading,
} from '../../components/member-ui';
export default function Carnet() {
  return (
    <ExperienceScreen tab>
      {(data) => (
        <>
          <Heading title="Tu carnet" subtitle="Pertenecer nos une." />
          <Card>
            <Badge>CLUB PUCARÁ</Badge>
            <Heading title={data.member.name} />
            <Copy>Socio {data.member.number}</Copy>
            <Copy>{data.member.administrativeStatus}</Copy>
            <View
              style={styles.code}
              accessible
              accessibilityLabel="Espacio reservado para el QR. Demostración sin validez de ingreso."
            >
              <Text style={styles.codeLabel}>QR DEMO</Text>
              <Copy muted>Sin validez de ingreso</Copy>
            </View>
          </Card>
          <Copy muted>
            Todos los datos son ficticios. El código verificable y su validación
            en el club se incorporarán en otro bloque.
          </Copy>
        </>
      )}
    </ExperienceScreen>
  );
}
const styles = StyleSheet.create({
  code: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.color.controlBorder,
    padding: theme.space.xl,
    gap: theme.space.md,
    alignItems: 'center',
    borderRadius: theme.radius.card,
  },
  codeLabel: {
    fontSize: theme.type.section,
    fontWeight: '700',
    color: theme.color.text,
  },
});
