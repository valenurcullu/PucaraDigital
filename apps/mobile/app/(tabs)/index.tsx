import { selectFirstTeamMatches, selectPersonalEvents } from '@pucara/shared';
import { ActionCard } from '../../components/action-card';
import {
  AppHeader,
  ExperienceScreen,
  Section,
  TileGrid,
} from '../../components/member-ui';
import { ReservationHub } from '../../features/experience/dashboard-cards';
import { moduleHref } from '../../features/experience/navigation';
import {
  EventRows,
  MatchRows,
  NoticeRows,
} from '../../features/experience/rows';

export default function Home() {
  return (
    <ExperienceScreen tab showDemoNotice={false}>
      {(data) => (
        <>
          <AppHeader
            title={'Hola, ' + data.member.firstName}
            subtitle="Tu próximo plan empieza en el club."
          />
          <ReservationHub data={data} />
          <TileGrid>
            <ActionCard
              title="Tu entrenamiento"
              action="Ver rutina"
              icon="gym"
              href={moduleHref('gimnasio')}
            />
            <ActionCard
              title="Tu cuenta"
              action="Ver cuenta corriente"
              detail={data.account.status}
              icon="account"
              href={moduleHref('cuenta-corriente')}
            />
          </TileGrid>
          <Section title="Primera en cancha">
            <MatchRows matches={selectFirstTeamMatches(data)} />
          </Section>
          <Section
            title="Tu próxima semana"
            action={{ title: 'Ver agenda', href: '/agenda' }}
          >
            <EventRows events={selectPersonalEvents(data).slice(0, 2)} />
          </Section>
          <Section
            title="La vida del club"
            action={{ title: 'Ver todas', href: moduleHref('novedades') }}
          >
            <NoticeRows data={data} limit={2} />
          </Section>
        </>
      )}
    </ExperienceScreen>
  );
}
