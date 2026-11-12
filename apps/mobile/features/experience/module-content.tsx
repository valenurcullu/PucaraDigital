import type {
  MemberActivity,
  MemberExperience,
  ModuleId,
} from '@pucara/shared';
import {
  Action,
  Badge,
  Card,
  Copy,
  NavRow,
  Section,
  StateView,
} from '../../components/member-ui';
import {
  formatDate,
  formatMoney,
  formatTime,
  moduleHref,
  targetHref,
} from './navigation';
import { MatchRows, ModuleLink, NoticeRows } from './rows';

function ReservationList({
  data,
  resource,
}: {
  data: MemberExperience;
  resource?: 'padel' | 'quincho';
}) {
  const reservations = data.reservations.filter(
    (r) => !resource || r.resource === resource,
  );
  return (
    <Section title="Mis reservas">
      {reservations.length ? (
        reservations.map((reservation) => (
          <NavRow
            key={reservation.id}
            title={reservation.title}
            detail={
              formatDate(reservation.startsAt) +
              ' · ' +
              (reservation.status === 'confirmed'
                ? 'Confirmada · demo'
                : reservation.status === 'pending'
                  ? 'Pendiente · demo'
                  : 'Cancelada · demo')
            }
            href={targetHref({ kind: 'reservation', id: reservation.id })}
          />
        ))
      ) : (
        <StateView
          title="Sin reservas"
          description="Tus próximos turnos aparecerán acá cuando se habiliten las reservas."
        />
      )}
    </Section>
  );
}
function ActivityContent({ activity }: { activity: MemberActivity }) {
  return (
    <>
      <Card>
        <Badge>
          {activity.enrollment === 'active'
            ? 'INSCRIPCIÓN ACTIVA · DEMO'
            : 'SIN INSCRIPCIÓN · DEMO'}
        </Badge>
        <Copy>{activity.description}</Copy>
        <Copy>{activity.schedule}</Copy>
        <Copy>{activity.location}</Copy>
        <Copy>{activity.availablePlaces} lugares disponibles · ejemplo</Copy>
      </Card>
      <Section title="Próximas clases">
        {activity.sessions.map((session) => (
          <Card key={session.id}>
            <Copy>
              {formatDate(session.startsAt)} a {formatTime(session.endsAt)}
            </Copy>
          </Card>
        ))}
      </Section>
      <Action
        title={
          activity.enrollment === 'active'
            ? 'Cancelar inscripción'
            : 'Inscribirme'
        }
        disabled
      />
      <Copy muted>
        Las inscripciones se habilitarán en un próximo bloque. Una inscripción
        recurrente incorpora clases futuras a tu Agenda; no confirma asistencia
        individual. La baja retira sólo las clases futuras de tu calendario.
      </Copy>
      <NavRow title="Ver mi agenda" href="/agenda" />
    </>
  );
}
export function ModuleContent({
  id,
  data,
}: {
  id: ModuleId;
  data: MemberExperience;
}) {
  switch (id) {
    case 'reservas':
      return (
        <>
          <ModuleLink data={data} id="padel" prominent />
          <ModuleLink data={data} id="quinchos" />
          <Card>
            <Copy>
              {data.padel.availableCredits} crédito de pádel disponible · demo
            </Copy>
            <Copy muted>
              1 crédito equivale a un turno completo. No es saldo en pesos.
            </Copy>
          </Card>
          <ReservationList data={data} />
        </>
      );
    case 'padel':
      return (
        <>
          <Card>
            <Badge>PÁDEL</Badge>
            <Copy>
              {data.padel.durationMinutes} minutos por turno ·{' '}
              {formatMoney(data.padel.priceMinor)}
            </Copy>
            <Copy>{data.padel.availableCredits} crédito disponible · demo</Copy>
            <Copy muted>
              Con un crédito, confirmás sin pagar de nuevo. Sin créditos, el
              turno requiere pago. Precio configurable por el club.
            </Copy>
          </Card>
          <ReservationList data={data} resource="padel" />
          <StateView
            title="Disponibilidad en el próximo bloque"
            description="Todavía no se pueden reservar turnos. Primero se probarán disponibilidad, cancelaciones y créditos en el servidor."
          />
        </>
      );
    case 'quinchos':
      return (
        <>
          <Copy>
            Elegí un espacio para compartir en el club. La aprobación y el pago
            dependerán de las condiciones de cada reserva.
          </Copy>
          <ReservationList data={data} resource="quincho" />
          <StateView
            title="Consulta de disponibilidad pendiente"
            description="La selección de fecha y horario se habilitará en otro bloque. Las condiciones de aprobación y pago deben validarse con el club."
          />
        </>
      );
    case 'yoga':
    case 'funcional': {
      const activity = data.activities.find((item) => item.id === id);
      return activity ? (
        <ActivityContent activity={activity} />
      ) : (
        <StateView
          title="Actividad no publicada"
          description="El club todavía no publicó horarios para esta actividad."
        />
      );
    }
    case 'rugby':
    case 'hockey':
      return (
        <>
          <Section title="Fixture">
            <MatchRows
              matches={data.matches.filter((match) => match.sport === id)}
            />
          </Section>
          <StateView
            title="Resultados y videos"
            description="Todavía no hay resultados ni videos publicados en esta demostración."
          />
        </>
      );
    case 'gimnasio':
      return (
        <>
          <Card>
            <Badge>ENTRENAMIENTO LIBRE</Badge>
            <Copy>Tu rutina, a tu ritmo.</Copy>
            <Copy muted>
              Entrená cuando puedas. Las rutinas no generan horarios automáticos
              en Agenda.
            </Copy>
          </Card>
          <StateView
            title="Todavía no hay una rutina asignada"
            description="La asignación de rutinas, el registro de cargas por serie y tu historial son parte del próximo bloque deportivo."
          />
        </>
      );
    case 'novedades':
      return <NoticeRows data={data} />;
    case 'cuenta-corriente':
      return (
        <Card>
          <Badge>SITUACIÓN ECONÓMICA · DEMO</Badge>
          <Copy>{data.account.status}</Copy>
          <Copy>Deuda: {formatMoney(data.account.amountDueMinor)}</Copy>
          <Copy>{data.account.scholarship}</Copy>
          <Copy muted>
            La situación económica es independiente del estado administrativo.
            No es una billetera ni un saldo disponible para reservas.
          </Copy>
        </Card>
      );
    case 'familia':
      return (
        <>
          {data.family.length ? (
            data.family.map((member) => (
              <Card key={member.id}>
                <Copy>{member.name}</Copy>
                <Copy>{member.relationship}</Copy>
                <Copy muted>{member.authorization}</Copy>
              </Card>
            ))
          ) : (
            <StateView
              title="Sin vínculos familiares"
              description="Los vínculos verificados se mostrarán acá."
            />
          )}
          <Copy muted>
            Un menor puede tener más de un responsable autorizado. El registro
            del socio y la cuenta de acceso son distintos; la verificación y los
            permisos aún no están implementados.
          </Copy>
        </>
      );
    case 'perfil':
      return (
        <Card>
          <Copy>{data.member.name}</Copy>
          <Copy>Socio {data.member.number}</Copy>
          <Copy>{data.member.administrativeStatus}</Copy>
          <Copy muted>
            Perfil ficticio de lectura. La edición se incorporará con identidad
            y permisos verificados.
          </Copy>
        </Card>
      );
    case 'eventos':
      return (
        <>
          <StateView
            title="Todavía no hay eventos publicados"
            description="Los encuentros abiertos del club aparecerán acá. Los compromisos personales están en Agenda."
          />
          <NavRow title="Ver novedades" href={moduleHref('novedades')} />
        </>
      );
    case 'buffet':
      return (
        <StateView
          title="Nos encontramos en el buffet"
          description="El club todavía no publicó horarios ni menú en esta demostración."
        />
      );
    case 'beneficios':
      return (
        <StateView
          title="Próximamente, beneficios para socios"
          description="Acá se publicarán los convenios vigentes con sus condiciones."
        />
      );
    case 'preferencias':
      return (
        <StateView
          title="Preferencias en un próximo bloque"
          description="Por ahora usamos el tamaño de texto del dispositivo. No guardamos datos personales ni preferencias."
        />
      );
    case 'soporte':
      return (
        <StateView
          title="Canales de atención pendientes"
          description="El club todavía debe confirmar sus datos de contacto. Esta demo no envía consultas."
        />
      );
  }
}
