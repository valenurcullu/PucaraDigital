import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { type MemberExperience, type MemberReservation } from '@pucara/shared';
import type { Href } from 'expo-router';
import { AppIcon } from '../../components/app-icon';
import {
  Command,
  color,
  DateBlock,
  Group,
  Label,
  layout,
  Pill,
  Sheet,
  Tap,
} from '../../components/handoff-ui';
import { MemberStage } from '../experience/member-stage';
import { ResourceTile } from '../experience/approved-dashboard';
import { formatTime, targetHref } from '../experience/navigation';
export function CreditInfo({ count }: { count: number }) {
  const [open, show] = useState(false);
  return (
    <>
      <Tap
        label="Información sobre créditos"
        onPress={() => show(true)}
        style={{ justifyContent: 'center', minHeight: 44 }}
      >
        <View
          style={[
            layout.row,
            {
              minHeight: 40,
              paddingHorizontal: 12,
              borderRadius: 20,
              backgroundColor: count ? color.successBackground : color.subtle,
            },
          ]}
        >
          <AppIcon
            name="credit"
            size={18}
            color={count ? color.success : color.secondaryText}
          />
          <Label role="label" ink={count ? color.success : color.secondaryText}>
            {count} {count === 1 ? 'crédito' : 'créditos'}
          </Label>
        </View>
      </Tap>
      {open && (
        <Sheet
          title={
            count === 1
              ? '1 crédito disponible'
              : count + ' créditos disponibles'
          }
          onClose={() => show(false)}
        >
          <AppIcon name="credit" size={48} color={color.success} />
          <Label>
            Un crédito cubre un turno completo de 90 minutos. Podés usarlo al
            confirmar.
          </Label>
          <Label role="meta">
            La cancelación elegible devuelve un crédito. La política definitiva
            está pendiente de validación con el club.
          </Label>
          <Command
            title="Entendido"
            variant="navy"
            onPress={() => show(false)}
          />
        </Sheet>
      )}
    </>
  );
}
export function ReservationRows({
  rows,
  manage,
}: {
  rows: readonly MemberReservation[];
  manage?: (id: string) => void;
}) {
  return (
    <Group title="Mis reservas">
      {rows.length ? (
        rows.map((r) => {
          const link: Href =
            r.resource === 'padel'
              ? { pathname: '/club/padel', params: { manage: r.id } }
              : targetHref({ kind: 'reservation', id: r.id });
          return (
            <Tap
              key={r.id}
              label={'Gestionar ' + r.title + ' ' + formatTime(r.startsAt)}
              {...(manage ? { onPress: () => manage(r.id) } : { href: link })}
              style={[layout.card, layout.row]}
            >
              <DateBlock instant={r.startsAt} />
              <View style={layout.grow}>
                <Label role="card">
                  {manage
                    ? formatTime(r.startsAt) + ' – ' + formatTime(r.endsAt)
                    : r.title}
                </Label>
                <Label role="meta" ink={color.secondaryText}>
                  {!manage
                    ? formatTime(r.startsAt) + ' – ' + formatTime(r.endsAt)
                    : r.resource === 'padel'
                      ? r.demoPayment === 'credit'
                        ? 'Con crédito'
                        : 'Pago simulado'
                      : r.location}
                </Label>
              </View>
              {manage ? (
                <Pill tone="blue">Gestionar</Pill>
              ) : (
                <Pill tone={r.status === 'pending' ? 'warning' : 'success'}>
                  {r.status === 'pending' ? 'Pendiente' : 'Confirmada'}
                </Pill>
              )}
            </Tap>
          );
        })
      ) : (
        <View style={layout.card}>
          <Label role="card">Todavía no tenés reservas</Label>
          <Label role="meta" ink={color.secondaryText}>
            Elegí un día y un horario para probar tu primer turno.
          </Label>
        </View>
      )}
    </Group>
  );
}
export function activeRows(data: MemberExperience) {
  return data.reservations
    .filter(
      (r) =>
        r.status !== 'cancelled' &&
        Date.parse(r.endsAt) > Date.parse(data.referenceInstant),
    )
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}
export function ReservationsPage() {
  return (
    <MemberStage>
      {(data) => (
        <ScrollView contentContainerStyle={layout.page}>
          <ResourceTile wide data={data} padel />
          <ResourceTile wide data={data} padel={false} />
          <View style={[layout.card, layout.row]}>
            <AppIcon name="credit" />
            <Label role="card" style={layout.grow}>
              1 crédito = 1 turno completo de pádel
            </Label>
            <CreditInfo count={data.padel.availableCredits} />
          </View>
          <ReservationRows rows={activeRows(data)} />
        </ScrollView>
      )}
    </MemberStage>
  );
}
