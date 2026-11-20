import { Stack, useLocalSearchParams } from 'expo-router';
import {
  ExperienceScreen,
  Heading,
  NavRow,
  StateView,
} from '../../components/member-ui';
import { ModuleContent } from '../../features/experience/module-content';
export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ExperienceScreen showDemoNotice={id !== 'padel'}>
      {(data) => {
        const module = data.modules.find((item) => item.id === id);
        if (!module)
          return (
            <>
              <StateView
                title="Módulo no encontrado"
                description="Este acceso no está disponible."
              />
              <NavRow title="Volver a Club" href="/club" />
            </>
          );
        return (
          <>
            <Stack.Screen options={{ title: module.title }} />
            <Heading title={module.title} subtitle={module.summary} />
            <ModuleContent id={module.id} data={data} />
          </>
        );
      }}
    </ExperienceScreen>
  );
}
