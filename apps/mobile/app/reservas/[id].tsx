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
  TileGrid,
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
              </Card>
            ) : null}
            <Section title="Gestionar reserva">
              <TileGrid>
                <Action title="Modificar" disabled />
                <Action title="Cancelar" variant="destructive" disabled />
              </TileGrid>
              <Copy muted>
                La modificación y la cancelación están deshabilitadas en la
                demo.
              </Copy>
            </Section>
            <NavRow title="Ver mi agenda" href="/agenda" />
          </>
        );
      }}
    </ExperienceScreen>
  );
}
