import { Ledger, accountHref } from '../account/account-ui';
import { DemoCaption } from './identity-ui';
import { Redirect } from 'expo-router';
import type { MemberExperience, ModuleId } from '@pucara/shared';
import { NavRow, Section, StateView } from '../../components/member-ui';
import { formatDate, moduleHref, targetHref } from './navigation';
import { MatchRows, NoticeRows } from './rows';

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
export function ModuleContent({
  id,
  data,
}: {
  id: ModuleId;
  data: MemberExperience;
}) {
  switch (id) {
    case 'reservas':
      return <Redirect href="/club/reservas" />;
    case 'padel':
      return <Redirect href="/club/padel" />;
    case 'quinchos':
      return (
        <>
          <ReservationList data={data} resource="quincho" />
          <StateView
            title="Consulta de disponibilidad pendiente"
            description="La consulta de horarios de quinchos aún no está habilitada."
          />
        </>
      );
    case 'yoga':
    case 'funcional':
      return (
        <Redirect
          href={{ pathname: '/club/actividades', params: { activity: id } }}
        />
      );
    case 'rugby':
    case 'hockey':
      return (
        <>
          <Section title="Fixture">
            <MatchRows
              showFixture={false}
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
      return <Redirect href="/club/gimnasio" />;
    case 'novedades':
      return <NoticeRows data={data} />;
    case 'cuenta-corriente':
      return (
        <>
          <Ledger data={data} />
          <DemoCaption>Importes de ejemplo.</DemoCaption>
        </>
      );
    case 'familia':
    case 'perfil':
      return <Redirect href={accountHref(id)} />;
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
    case 'soporte':
      return <Redirect href={accountHref(id)} />;
  }
}
