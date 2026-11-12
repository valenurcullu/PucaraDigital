import { selectFirstTeamMatches, selectPersonalEvents } from '@pucara/shared';
import {
  ExperienceScreen,
  Heading,
  NavRow,
  Section,
} from '../../components/member-ui';
import {
  EventRows,
  MatchRows,
  ModuleLink,
  NoticeRows,
} from '../../features/experience/rows';
export default function Home() {
  return (
    <ExperienceScreen tab>
      {(data) => (
        <>
          <Heading
            title={'Hola, ' + data.member.firstName}
            subtitle="Tu día, tu gente, tu club."
          />
          <Section title="A un toque">
            <ModuleLink data={data} id="reservas" prominent />
            <ModuleLink data={data} id="gimnasio" />
            <ModuleLink data={data} id="cuenta-corriente" />
          </Section>
          <Section title="Primera en cancha">
            <MatchRows matches={selectFirstTeamMatches(data)} />
          </Section>
          <Section title="Para vos">
            <EventRows events={selectPersonalEvents(data).slice(0, 2)} />
            <NavRow title="Ver mi agenda" href="/agenda" />
          </Section>
          <Section title="Novedades y comunicaciones">
            <NoticeRows data={{ ...data, notices: data.notices.slice(0, 2) }} />
            <ModuleLink data={data} id="novedades" />
          </Section>
        </>
      )}
    </ExperienceScreen>
  );
}
