import {
  Card,
  Copy,
  ExperienceScreen,
  Heading,
  Section,
} from '../../components/member-ui';
import { ModuleLink } from '../../features/experience/rows';
export default function Account() {
  return (
    <ExperienceScreen tab>
      {(data) => (
        <>
          <Heading title="Tu cuenta" subtitle={data.member.name} />
          <Card>
            <Copy>Socio {data.member.number}</Copy>
            <Copy>{data.member.administrativeStatus}</Copy>
          </Card>
          <Section title="Tu relación con el club">
            <ModuleLink data={data} id="cuenta-corriente" />
            <ModuleLink data={data} id="familia" />
          </Section>
          <Section title="Información y ayuda">
            {(['perfil', 'preferencias', 'soporte'] as const).map((id) => (
              <ModuleLink key={id} data={data} id={id} />
            ))}
          </Section>
        </>
      )}
    </ExperienceScreen>
  );
}
