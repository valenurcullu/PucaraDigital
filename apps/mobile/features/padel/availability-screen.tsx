import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { memberTheme as theme } from '@pucara/design-tokens';
import {
  offsetClubDay,
  padelDayQuery,
  type PadelAvailabilityReader,
  type PadelSlot,
} from '@pucara/shared';
import { AppIcon } from '../../components/app-icon';
import {
  Action,
  Card,
  Copy,
  Heading,
  Section,
  StateView,
} from '../../components/member-ui';
import {
  loadAvailability,
  slotLabels,
  type AvailableCourt,
  type AvailabilityState,
} from './availability-model';

import { dayLabels } from '../experience/calendar';
import { DateStrip } from '../../components/date-strip';
interface Props {
  reader: PadelAvailabilityReader<AbortSignal>;
  clubId: string;
  firstDay: string;
}
export function PadelAvailabilityScreen({ reader, clubId, firstDay }: Props) {
  const days = useMemo(
    () => [0, 1, 2, 3].map((offset) => offsetClubDay(firstDay, offset)),
    [firstDay],
  );
  const [day, setDay] = useState(firstDay);
  return (
    <>
      <Section title="Elegí un día">
        <DateStrip days={days} selected={day} onSelect={setDay} />
      </Section>
      <DayResults
        key={clubId + day}
        reader={reader}
        clubId={clubId}
        day={day}
      />
    </>
  );
}

function DayResults({
  reader,
  clubId,
  day,
}: Omit<Props, 'firstDay'> & { day: string }) {
  const [state, setState] = useState<AvailabilityState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [selection, select] = useState<{
    court: string;
    slot: PadelSlot;
  } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void loadAvailability(
      reader,
      padelDayQuery(clubId, day),
      controller.signal,
      setState,
    );
    return () => controller.abort();
  }, [reader, clubId, day, attempt]);
  if (state.status === 'loading')
    return (
      <View style={styles.loading} accessibilityLiveRegion="polite">
        <ActivityIndicator color={theme.color.action} />
        <Copy>Consultando horarios…</Copy>
      </View>
    );
  if (state.status === 'empty')
    return (
      <StateView
        title="Sin turnos para este día"
        description="Elegí otra fecha para ver más horarios de ejemplo."
      />
    );
  if (state.status !== 'ready')
    return (
      <StateView
        title="No pudimos cargar los horarios"
        description="Podés volver a consultar esta fecha."
        retry={() => setAttempt((n) => n + 1)}
      />
    );
  return (
    <Section title={dayLabels(day).full}>
      {state.courts.map((court) => (
        <CourtSlots
          key={court.id}
          court={court}
          onSelect={(slot) => select({ court: court.name, slot })}
        />
      ))}
      {selection && (
        <SlotSummary
          court={selection.court}
          slot={selection.slot}
          day={day}
          onClose={() => select(null)}
        />
      )}
    </Section>
  );
}

export function CourtSlots({
  court,
  onSelect,
}: {
  court: AvailableCourt;
  onSelect: (slot: PadelSlot) => void;
}) {
  return (
    <Card>
      <View style={styles.courtTitle}>
        <AppIcon name="padel" color={theme.color.action} />
        <Text accessibilityRole="header" style={styles.name}>
          {court.name}
        </Text>
      </View>
      {court.slots.map((slot) => {
        const labels = slotLabels(slot);
        return (
          <Pressable
            key={slot.starts_at}
            accessibilityRole="button"
            accessibilityLabel={
              court.name +
              ', ' +
              labels.start +
              ' a ' +
              labels.end +
              ', ' +
              labels.duration +
              ', ' +
              labels.price
            }
            accessibilityHint="Abre el resumen del turno"
            onPress={() => onSelect(slot)}
            style={({ pressed }) => [styles.slot, pressed && styles.pressed]}
          >
            <View style={styles.time}>
              <Text style={styles.hour}>
                {labels.start} – {labels.end}
              </Text>
              <Text style={styles.detail}>{labels.duration}</Text>
            </View>
            <View style={styles.amount}>
              <Text style={styles.price}>{labels.price}</Text>
              <Text style={styles.openSlot}>Ver resumen</Text>
            </View>
          </Pressable>
        );
      })}
    </Card>
  );
}
export function SlotSummary({
  court,
  slot,
  day,
  onClose,
}: {
  court: string;
  slot: PadelSlot;
  day: string;
  onClose: () => void;
}) {
  const labels = slotLabels(slot);
  return (
    <Modal animationType="slide" transparent visible onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView
          edges={['bottom', 'left', 'right']}
          style={styles.sheet}
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
        >
          <ScrollView bounces={false} contentContainerStyle={styles.summary}>
            <Heading title="Resumen del turno" subtitle={dayLabels(day).full} />
            <View style={styles.receipt}>
              <View style={styles.courtTitle}>
                <AppIcon name="padel" color={theme.color.action} />
                <Text style={styles.name}>{court}</Text>
              </View>
              <Text style={styles.summaryTime}>
                {labels.start} – {labels.end}
              </Text>
              <Text style={styles.detail}>
                {labels.duration} · Turno completo
              </Text>
              <View style={styles.total}>
                <Text style={styles.detail}>Precio del turno</Text>
                <Text style={styles.price}>{labels.price}</Text>
              </View>
            </View>
            <Copy muted>Turno de ejemplo. No se generó una reserva.</Copy>
            <Action title="Volver a los horarios" onPress={onClose} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pressed: {
    backgroundColor: theme.color.navySoft,
    borderColor: theme.color.navy,
  },
  loading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.space.md,
    paddingVertical: theme.space.lg,
  },
  courtTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.space.sm,
  },
  name: {
    flexShrink: 1,
    fontSize: theme.type.section,
    fontWeight: '700',
    color: theme.color.navy,
  },
  slot: {
    borderWidth: 1,
    borderColor: theme.color.controlBorder,
    minHeight: 62,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.space.md,
    gap: theme.space.sm,
    backgroundColor: theme.color.navySoft,
    borderRadius: theme.radius.control,
  },
  time: { gap: 2 },
  hour: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.color.text,
    fontVariant: ['tabular-nums'],
  },
  detail: { fontSize: theme.type.secondary, color: theme.color.secondaryText },
  amount: { gap: theme.space.xs, alignItems: 'flex-end' },
  openSlot: {
    color: theme.color.action,
    fontWeight: '700',
    fontSize: theme.type.secondary,
  },
  price: {
    fontSize: theme.type.body,
    fontWeight: '700',
    color: theme.color.navy,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(12, 23, 38, 0.45)',
  },
  sheet: {
    maxHeight: '90%',
    backgroundColor: theme.color.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  summary: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: theme.space.xl,
    gap: theme.space.lg,
  },
  receipt: {
    padding: theme.space.lg,
    gap: theme.space.sm,
    borderRadius: theme.radius.card,
    backgroundColor: theme.color.navySoft,
  },
  summaryTime: { fontSize: 28, fontWeight: '700', color: theme.color.navy },
  total: {
    borderTopColor: theme.color.border,
    borderTopWidth: 1,
    paddingTop: theme.space.md,
    marginTop: theme.space.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
