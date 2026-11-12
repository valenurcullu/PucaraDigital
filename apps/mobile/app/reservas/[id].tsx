import { useLocalSearchParams } from 'expo-router';
import {
  Action,
  Badge,
  Card,
  Copy,
  ExperienceScreen,
  Heading,
  NavRow,
  Section,
  StateView,
} from '../../components/member-ui';
import {
  formatDate,
  formatTime,
  moduleHref,
} from '../../features/experience/navigation';
export default function ReservationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ExperienceScreen>
      {(data) => {
        const reservation = data.reservations.find((item) => item.id === id);
        if (!reservation)
          return (
            <>
              <StateView
                title="Reserva no encontrada"
                description="Esta reserva no está disponible."
              />
              <NavRow title="Mis reservas" href={moduleHref('reservas')} />
            </>
          );
        const padel = reservation.resource === 'padel';
        return (
          <>
            <Heading
              title={reservation.title}
              subtitle="Reserva ficticia · no habilita el uso del espacio"
            />
            <Card>
              <Badge>
                {reservation.status === 'confirmed'
                  ? 'CONFIRMADA · DEMO'
                  : reservation.status === 'pending'
                    ? 'PENDIENTE · DEMO'
                    : 'CANCELADA · DEMO'}
              </Badge>
              <Copy>
                {formatDate(reservation.startsAt)} a{' '}
                {formatTime(reservation.endsAt)}
              </Copy>
              <Copy>{reservation.location}</Copy>
              <Copy>Titular: {data.member.name}</Copy>
            </Card>
            {padel ? (
              <Card>
                <Copy>
                  {data.padel.availableCredits} crédito de turno disponible ·
                  demo
                </Copy>
                <Copy muted>
                  1 crédito = 1 turno de 90 minutos. No hay saldo monetario
                  interno.
                </Copy>
              </Card>
            ) : null}
            <Section title="Gestionar reserva">
              <Action title="Modificar" disabled />
              <Copy muted>
                {padel
                  ? 'Elegirás otra fecha y hora y confirmarás la modificación, sin pagar ni generar créditos. Si falla, se conserva el turno original.'
                  : 'El cambio de fecha y horario se habilitará cuando estén definidas las condiciones del quincho.'}
              </Copy>
              <Action title="Cancelar" disabled />
              <Copy muted>
                {padel
                  ? 'Se solicitará confirmación. Si cumple la política del club, la cancelación liberará el turno y generará exactamente 1 crédito.'
                  : 'Se solicitará confirmación y se mostrarán las condiciones de cancelación del quincho.'}
              </Copy>
            </Section>
            <Copy muted>
              Estas acciones todavía no están habilitadas. Las políticas de
              cancelación y reintegros siguen pendientes de validación con el
              club.
            </Copy>
            <NavRow title="Ver mi agenda" href="/agenda" />
          </>
        );
      }}
    </ExperienceScreen>
  );
}
