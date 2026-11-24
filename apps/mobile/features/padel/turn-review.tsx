import { View } from 'react-native';
import type { PadelSlot } from '@pucara/shared';
import { AppIcon } from '../../components/app-icon';
import {
  Command,
  Label,
  Tap,
  color,
  layout,
  longDate,
} from '../../components/handoff-ui';
import { formatTime } from '../experience/navigation';
import { slotLabels } from './availability-model';
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={layout.between}>
      <Label role="meta" ink={color.secondaryText}>
        {label}
      </Label>
      <Label role="card">{value}</Label>
    </View>
  );
}

export function TurnReview({
  slot,
  credits,
  method,
  pay,
  confirm,
  changeTime,
}: {
  slot: PadelSlot;
  credits: number;
  method: 'credit' | 'pay';
  pay: (method: 'credit' | 'pay') => void;
  confirm: () => void;
  changeTime: () => void;
}) {
  return (
    <>
      <View
        style={[
          layout.card,
          layout.group,
          {
            backgroundColor: color.background,
          },
        ]}
      >
        <Detail label="Día" value={longDate.format(new Date(slot.starts_at))} />
        <Detail
          label="Horario"
          value={formatTime(slot.starts_at) + ' – ' + formatTime(slot.ends_at)}
        />
        <Detail
          label="Duración"
          value={slotLabels(slot).duration.replace(' min', ' minutos')}
        />
        <Detail label="Precio del turno" value={slotLabels(slot).price} />
      </View>
      {!credits ? (
        <Label>No tenés créditos de turno disponibles.</Label>
      ) : (
        <View style={layout.group}>
          <Label role="subhead">¿Cómo querés reservar?</Label>
          {(['credit', 'pay'] as const).map((m) => (
            <Tap
              key={m}
              label={m === 'credit' ? 'Usar 1 crédito' : 'Pagar el turno'}
              selected={method === m}
              onPress={() => pay(m)}
              style={[
                layout.card,
                layout.row,
                {
                  borderColor: method === m ? color.action : color.border,
                  borderWidth: method === m ? 2 : 1,
                  backgroundColor: color.surface,
                },
              ]}
            >
              <AppIcon name={m === 'credit' ? 'credit' : 'payment'} />
              <View style={layout.grow}>
                <Label role="card">
                  {m === 'credit'
                    ? 'Usar 1 crédito'
                    : 'Pagar ' + slotLabels(slot).price}
                </Label>
                <Label role="meta">
                  {m === 'credit'
                    ? 'Sin pagar · te quedan ' + (credits - 1)
                    : 'Guardás tu crédito'}
                </Label>
              </View>
              <Label ink={color.action}>{method === m ? '●' : '○'}</Label>
            </Tap>
          ))}
        </View>
      )}
      <Command
        title={
          method === 'credit'
            ? 'Confirmar con 1 crédito'
            : 'Confirmar y pagar ' + slotLabels(slot).price
        }
        onPress={confirm}
      />
      <Command
        title="Cambiar horario"
        variant="secondary"
        onPress={changeTime}
      />
      <Label role="meta" ink={color.warning} style={{ textAlign: 'center' }}>
        Demostración · no se realiza ningún cobro.
      </Label>
    </>
  );
}
