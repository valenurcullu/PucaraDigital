import { ActionCard } from '../../components/action-card';
import {
  AppHeader,
  ExperienceScreen,
  Section,
  TileGrid,
} from '../../components/member-ui';
import { ReservationHub } from '../../features/experience/dashboard-cards';
import { moduleHref } from '../../features/experience/navigation';
import { modulePresentation } from '../../features/experience/module-presentation';

export default function Club() {
  return (
    <ExperienceScreen tab showDemoNotice={false}>
      {(data) => (
        <>
          <AppHeader
            title="Tu club, a mano."
            subtitle="Entrená, encontrate, disfrutá."
          />
          <ReservationHub data={data} />
          {data.groups
            .filter((group) => !group.modules.includes('padel'))
            .map((group) => (
              <Section key={group.title} title={group.title}>
                <TileGrid>
                  {group.modules.map((id) => {
                    const module = data.modules.find((item) => item.id === id);
                    if (!module) return null;
                    const presentation = modulePresentation[id];
                    const activity = data.activities.find(
                      (item) => item.id === id,
                    );
                    return (
                      <ActionCard
                        key={id}
                        title={module.title}
                        action={presentation.action}
                        icon={presentation.icon}
                        href={moduleHref(id)}
                        accent={id === 'gimnasio'}
                        {...(activity?.enrollment === 'active'
                          ? { badge: 'Inscripto · demo' }
                          : {})}
                      />
                    );
                  })}
                </TileGrid>
              </Section>
            ))}
        </>
      )}
    </ExperienceScreen>
  );
}
