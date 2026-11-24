import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';
import { Label, layout } from '../../../components/handoff-ui';
import { MemberStage } from '../../../features/experience/member-stage';
import { AccountDetail } from '../../../features/account/screens';
import {
  sectionTitles,
  type AccountSection,
} from '../../../features/account/account-ui';
export default function Section() {
  const { section, id } = useLocalSearchParams<{
    section: string;
    id?: string;
  }>();
  const key = Object.hasOwn(sectionTitles, section)
    ? (section as AccountSection)
    : undefined;
  return (
    <>
      <Stack.Screen options={{ title: key ? sectionTitles[key] : 'Cuenta' }} />
      <MemberStage>
        {(data) => (
          <ScrollView
            contentInsetAdjustmentBehavior="never"
            contentContainerStyle={layout.page}
          >
            {key ? (
              <AccountDetail section={key} data={data} id={id} />
            ) : (
              <Label>Sección no disponible.</Label>
            )}
          </ScrollView>
        )}
      </MemberStage>
    </>
  );
}
