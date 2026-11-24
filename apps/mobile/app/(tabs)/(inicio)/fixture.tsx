import { ScrollView } from 'react-native';
import { Group, layout, Label, color } from '../../../components/handoff-ui';
import { MemberStage } from '../../../features/experience/member-stage';
import { MatchRows } from '../../../features/experience/rows';
export default function Fixture() {
  return (
    <MemberStage>
      {(data) => (
        <ScrollView contentContainerStyle={layout.page}>
          {(['rugby', 'hockey'] as const).map((sport) => (
            <Group key={sport} title={sport === 'rugby' ? 'Rugby' : 'Hockey'}>
              <MatchRows
                matches={data.matches.filter((m) => m.sport === sport)}
                showFixture={false}
              />
            </Group>
          ))}
          <Group title="Resultados">
            <Label role="meta" ink={color.secondaryText}>
              Todavía no hay resultados publicados.
            </Label>
          </Group>
        </ScrollView>
      )}
    </MemberStage>
  );
}
