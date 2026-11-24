import { SlotPicker } from './slot-picker';
import { ReservationSheet } from './reservation-sheet';
import { TurnReview } from './turn-review';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  clubDay,
  createDemoPadelReader,
  demoClub,
  offsetClubDay,
  type MemberExperience,
  type PadelSlot,
} from '@pucara/shared';
import { AppIcon } from '../../components/app-icon';
import {
  color,
  Command,
  Label,
  layout,
  longDate,
  Sheet,
} from '../../components/handoff-ui';
import { MemberStage } from '../experience/member-stage';
import { formatMoney, formatTime } from '../experience/navigation';
import { useExperience } from '../experience/provider';
import { loadAvailability, type AvailabilityState } from './availability-model';
import { activeRows, CreditInfo, ReservationRows } from './reservations-page';

const dayText = (d: string) => longDate.format(new Date(d));
const range = (start: string, end: string) =>
  formatTime(start) + ' – ' + formatTime(end);
export function PadelPage() {
  const { manage } = useLocalSearchParams<{ manage?: string }>();
  return (
    <MemberStage>
      {(data) => (
        <PadelFlow key={manage ?? 'picker'} data={data} manage={manage} />
      )}
    </MemberStage>
  );
}
type Panel = 'review' | 'success' | null;
export function PadelFlow({
  data,
  manage,
}: {
  data: MemberExperience;
  manage?: string | undefined;
}) {
  const router = useRouter(),
    { preview } = useExperience();
  const first = clubDay(new Date(data.referenceInstant));
  const [day, setDay] = useState(() => offsetClubDay(first, 1)),
    [slot, pick] = useState<PadelSlot>(),
    [panel, show] = useState<Panel>(null);
  const [managed, setManaged] = useState(manage),
    [method, pay] = useState<'credit' | 'pay'>('pay'),
    [message, tell] = useState(''),
    [retry, reload] = useState(0);
  const [availability, publish] = useState<AvailabilityState>({
    status: 'loading',
  });
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => tell(''), 2600);
      return () => clearTimeout(timer);
    }
  }, [message]);
  useEffect(() => {
    const controller = new AbortController();
    const reader = createDemoPadelReader(
      first,
      data.padel.priceMinor,
      process.env.EXPO_PUBLIC_DATA_MODE,
      data.reservations
        .filter((r) => r.resource === 'padel' && r.status === 'confirmed')
        .map((r) => r.startsAt),
    );
    void loadAvailability(
      reader,
      {
        p_club: demoClub.id,
        p_from: data.referenceInstant,
        p_until: offsetClubDay(first, 14) + 'T00:00:00-03:00',
      },
      controller.signal,
      publish,
    );
    return () => controller.abort();
  }, [
    first,
    data.padel.priceMinor,
    data.reservations,
    data.referenceInstant,
    retry,
  ]);
  const rows = activeRows(data).filter((r) => r.resource === 'padel');
  const byDay = useMemo(() => {
    const grouped = new Map<string, PadelSlot[]>();
    if (availability.status === 'ready')
      for (const court of availability.courts)
        for (const row of court.slots) {
          const key = clubDay(new Date(row.starts_at));
          const existing = grouped.get(key);
          if (existing) existing.push(row);
          else grouped.set(key, [row]);
        }
    return grouped;
  }, [availability]);
  const calendar = {
    first,
    byDay,
    status: availability.status,
    onRetry: () => reload((x) => x + 1),
  };
  const changeDay = (d: string) => {
    setDay(d);
    pick(undefined);
    tell('');
  };
  const reset = () => {
    show(null);
    pick(undefined);
  };
  function confirm() {
    if (!slot) return;
    const ok = preview(
      { action: 'book', slot, method, id: 'preview-' + Date.now() },
      data,
    );
    if (!ok) {
      reset();
      tell('El turno cambió. Volvé a elegir un horario.');
      return;
    }
    show('success');
  }
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={layout.page}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={layout.between}>
          <View style={layout.grow}>
            <Label role="card">Cancha de pádel</Label>
            <Label role="meta" ink={color.secondaryText}>
              Turnos de {data.padel.durationMinutes} min ·{' '}
              {formatMoney(data.padel.priceMinor)}
            </Label>
          </View>
          <CreditInfo count={data.padel.availableCredits} />
        </View>
        {!!message && (
          <View
            accessibilityLiveRegion="polite"
            style={[layout.card, { backgroundColor: color.navy }]}
          >
            <Label role="card" ink="white">
              {message}
            </Label>
          </View>
        )}
        <SlotPicker
          calendar={calendar}
          day={day}
          selectedStart={slot?.starts_at}
          changeDay={changeDay}
          pick={pick}
        />
        <ReservationRows rows={rows} manage={setManaged} />
        <Label role="meta" ink={color.secondaryText}>
          DEMO · Horarios ficticios. Los cambios duran solo esta sesión.
        </Label>
      </ScrollView>
      {slot && panel !== 'success' && (
        <View
          style={[
            layout.row,
            {
              backgroundColor: color.surface,
              padding: 12,
              borderTopWidth: 1,
              borderColor: color.border,
            },
          ]}
        >
          <View style={layout.grow}>
            <Label role="label">{dayText(slot.starts_at)}</Label>
            <Label role="number">{range(slot.starts_at, slot.ends_at)}</Label>
          </View>
          <Command
            title="Continuar"
            onPress={() => {
              pay(data.padel.availableCredits ? 'credit' : 'pay');
              show('review');
            }}
          />
        </View>
      )}
      {managed && (
        <ReservationSheet
          reservation={rows.find((r) => r.id === managed)}
          calendar={calendar}
          onClose={() => setManaged(undefined)}
          onMove={(candidate) => {
            const ok = preview(
              { action: 'move', id: managed, slot: candidate },
              data,
            );
            if (ok && slot?.starts_at === candidate.starts_at) pick(undefined);
            return ok;
          }}
          onCancel={() => {
            const ok = preview(
              { action: 'cancel', id: managed, exampleEligible: true },
              data,
            );
            setManaged(undefined);
            tell(
              ok
                ? 'Turno cancelado · +1 crédito demo'
                : 'La reserva ya cambió. Revisá Mis reservas.',
            );
          }}
        />
      )}
      {panel && (
        <Sheet
          title={
            panel === 'success' ? '¡Turno reservado!' : 'Confirmá tu turno'
          }
          showTitle={panel !== 'success'}
          onClose={() => (panel === 'success' ? reset() : show(null))}
        >
          {panel === 'review' && slot && (
            <TurnReview
              slot={slot}
              credits={data.padel.availableCredits}
              method={method}
              pay={pay}
              confirm={confirm}
              changeTime={() => show(null)}
            />
          )}
          {panel === 'success' && slot && (
            <>
              <View style={{ alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: color.successBackground,
                    borderRadius: 36,
                  }}
                >
                  <AppIcon name="check" size={48} color={color.successSolid} />
                </View>
                <Label role="sheet">¡Turno reservado!</Label>
              </View>
              <Label role="card" style={{ textAlign: 'center' }}>
                {dayText(slot.starts_at)}
              </Label>
              <Label
                role="number"
                style={{ fontSize: 30, textAlign: 'center' }}
              >
                {range(slot.starts_at, slot.ends_at)}
              </Label>
              <Label>
                {method === 'credit'
                  ? 'Con 1 crédito demo · Ya está en tu Agenda.'
                  : 'Pago simulado · Ya está en tu Agenda.'}
              </Label>
              <Command title="Listo" onPress={reset} />
              <Command
                title="Ver en Agenda"
                variant="secondary"
                onPress={() => {
                  const day = clubDay(new Date(slot.starts_at));
                  reset();
                  router.navigate({
                    pathname: '/agenda',
                    params: { day, receipt: String(Date.now()) },
                  });
                }}
              />
            </>
          )}
        </Sheet>
      )}
    </View>
  );
}
