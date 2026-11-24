import { useState } from 'react';
import { View } from 'react-native';
import {
  clubDay,
  type MemberReservation,
  type PadelSlot,
} from '@pucara/shared';
import {
  color,
  Command,
  DateBlock,
  Label,
  layout,
  longDate,
  Pill,
  Sheet,
} from '../../components/handoff-ui';
import { formatTime } from '../experience/navigation';
import { SlotPicker, type SlotCalendar } from './slot-picker';
type Step =
  | { kind: 'detail' | 'cancel' | 'moved' }
  | { kind: 'edit'; day: string; start?: string; error?: string };
const dayText = (instant: string) => longDate.format(new Date(instant));
const range = (a: string, b: string) => formatTime(a) + ' – ' + formatTime(b);
export function ReservationSheet({
  reservation,
  calendar,
  onClose,
  onMove,
  onCancel,
}: {
  reservation: MemberReservation | undefined;
  calendar: SlotCalendar;
  onClose: () => void;
  onMove: (slot: PadelSlot) => boolean;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<Step>({ kind: 'detail' });
  const draft = step.kind === 'edit' ? step : undefined;
  const candidate =
    calendar.status === 'ready' && draft && reservation
      ? calendar.byDay
          .get(draft.day)
          ?.find(
            (row) =>
              row.starts_at === draft.start &&
              Date.parse(row.starts_at) !== Date.parse(reservation.startsAt),
          )
      : undefined;
  function confirm() {
    if (!candidate || !draft) return;
    if (onMove(candidate)) setStep({ kind: 'moved' });
    else {
      setStep({
        kind: 'edit',
        day: draft.day,
        error: 'El horario cambió. Elegí otro turno.',
      });
      calendar.onRetry();
    }
  }
  const detail = () => setStep({ kind: 'detail' });
  return (
    <Sheet
      title={
        draft
          ? 'Modificar reserva'
          : step.kind === 'cancel'
            ? '¿Cancelar este turno?'
            : 'Pádel'
      }
      onClose={onClose}
      dismissibleHandle
      scrollKey={step.kind}
      footer={
        candidate ? (
          <Command title="Confirmar modificación" onPress={confirm} />
        ) : undefined
      }
    >
      {!reservation ? (
        <>
          <Label>Esta reserva ya no está disponible.</Label>
          <Command title="Cerrar" variant="quiet" onPress={onClose} />
        </>
      ) : draft ? (
        <>
          <View
            style={[
              layout.card,
              layout.group,
              { backgroundColor: color.background },
            ]}
          >
            <Label role="label">Reserva actual</Label>
            <Label role="card">{dayText(reservation.startsAt)}</Label>
            <Label role="number">
              {range(reservation.startsAt, reservation.endsAt)}
            </Label>
            <Label role="meta" ink={color.secondaryText}>
              Tu turno sigue vigente hasta confirmar.
            </Label>
          </View>
          <SlotPicker
            calendar={calendar}
            day={draft.day}
            selectedStart={draft.start}
            editing
            changeDay={(day) => setStep({ kind: 'edit', day })}
            pick={(slot) =>
              setStep(
                slot
                  ? { kind: 'edit', day: draft.day, start: slot.starts_at }
                  : { kind: 'edit', day: draft.day },
              )
            }
          />
          {draft.error && (
            <View accessibilityLiveRegion="polite">
              <Label ink={color.error}>{draft.error}</Label>
            </View>
          )}
          <Command
            title="Volver al detalle"
            variant="secondary"
            onPress={detail}
          />
          <Command title="Cerrar" variant="quiet" onPress={onClose} />
        </>
      ) : step.kind === 'cancel' ? (
        <>
          <Label>
            {dayText(reservation.startsAt)} · {formatTime(reservation.startsAt)}
          </Label>
          <View
            style={[layout.card, { backgroundColor: color.warningBackground }]}
          >
            <Label>
              El horario queda libre. La política del club está pendiente de
              definición. En esta demo recibís 1 crédito para otro turno.
            </Label>
          </View>
          <Command title="Sí, cancelar" variant="danger" onPress={onCancel} />
          <Command
            title="No, mantener reserva"
            variant="secondary"
            onPress={detail}
          />
        </>
      ) : (
        <>
          {step.kind === 'moved' ? (
            <View
              accessibilityLiveRegion="polite"
              style={[
                layout.card,
                { backgroundColor: color.successBackground },
              ]}
            >
              <Label role="card" ink={color.success}>
                Reserva modificada · demo
              </Label>
              <Label role="meta">El nuevo horario ya está en tu Agenda.</Label>
            </View>
          ) : (
            <Pill tone="success">Confirmada · demo</Pill>
          )}
          <View
            style={[
              layout.card,
              layout.row,
              { backgroundColor: color.background },
            ]}
          >
            <DateBlock instant={reservation.startsAt} />
            <View style={layout.grow}>
              <Label role="meta">{dayText(reservation.startsAt)}</Label>
              <Label role="number">
                {range(reservation.startsAt, reservation.endsAt)}
              </Label>
              <Label role="meta" ink={color.secondaryText}>
                Cancha de pádel · 90 min ·{' '}
                {reservation.demoPayment === 'credit'
                  ? 'Con 1 crédito'
                  : 'Pago simulado'}
              </Label>
            </View>
          </View>

          <Command
            title="Modificar"
            variant="navy"
            icon="edit"
            onPress={() =>
              setStep({
                kind: 'edit',
                day: clubDay(new Date(reservation.startsAt)),
              })
            }
          />
          <Command
            title="Cancelar reserva"
            variant="outline"
            icon="cancel"
            onPress={() => setStep({ kind: 'cancel' })}
          />
          <Command title="Cerrar" variant="quiet" onPress={onClose} />
        </>
      )}
    </Sheet>
  );
}
