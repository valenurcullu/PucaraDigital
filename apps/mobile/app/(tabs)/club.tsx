import { ExperienceScreen, Heading, Section } from '../../components/member-ui';
import { ModuleLink } from '../../features/experience/rows';
export default function Club() {
  return (
    <ExperienceScreen tab>
      {(data) => (
        <>
          <Heading
            title="Viví Pucará"
            subtitle="Encontrá tu lugar en el club."
          />
          {data.groups.map((group, index) => (
            <Section key={group.title} title={group.title}>
              {group.modules.map((id) => (
                <ModuleLink
                  key={id}
                  data={data}
                  id={id}
                  prominent={index === 0}
                />
              ))}
              {index === 0 ? <ModuleLink data={data} id="reservas" /> : null}
            </Section>
          ))}
        </>
      )}
    </ExperienceScreen>
  );
}
