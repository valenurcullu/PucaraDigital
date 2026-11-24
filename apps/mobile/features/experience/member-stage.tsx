import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';
import type { MemberExperience } from '@pucara/shared';
import { useExperience } from './provider';
import { StateView } from '../../components/member-ui';
import { color } from '../../components/handoff-ui';
export function MemberStage({
  children,
  root = false,
  hero = false,
}: {
  children: (data: MemberExperience) => ReactNode;
  root?: boolean;
  hero?: boolean;
}) {
  const { state, reload } = useExperience();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: hero ? color.navy : color.background }}
      edges={{ top: root, bottom: true, left: true, right: true }}
    >
      <View style={{ flex: 1, backgroundColor: color.background }}>
        {state.status === 'ready' ? (
          children(state.data)
        ) : state.status === 'error' ? (
          <StateView
            title="No pudimos cargar tu club"
            description={state.message}
            retry={reload}
          />
        ) : (
          <ActivityIndicator
            accessibilityLabel="Cargando"
            color={color.action}
            style={{ padding: 32 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
