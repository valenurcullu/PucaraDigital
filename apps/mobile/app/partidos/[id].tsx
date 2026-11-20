import { useLocalSearchParams } from 'expo-router';
import {
  Badge,
  Card,
  Copy,
  ExperienceScreen,
  Heading,
  NavRow,
  StateView,
} from '../../components/member-ui';
import { formatDate, moduleHref } from '../../features/experience/navigation';
export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ExperienceScreen>
      {(data) => {
        const match = data.matches.find((item) => item.id === id);
        if (!match)
          return (
            <>
              <StateView
                title="Partido no encontrado"
                description="El encuentro no está publicado."
              />
              <NavRow title="Ir al Inicio" href="/" />
            </>
          );
        return (
          <>
            <Heading
              title={'Pucará vs. ' + match.opponent}
              subtitle={
                (match.sport === 'rugby' ? 'Rugby' : 'Hockey') +
                ' · ' +
                match.division
              }
            />
            <Card>
              <Badge>{match.venue === 'home' ? 'LOCAL' : 'VISITANTE'}</Badge>
              <Copy>{formatDate(match.startsAt)}</Copy>
              <Copy>{match.location}</Copy>
            </Card>

            <NavRow
              title="Ver fixture del deporte"
              href={moduleHref(match.sport)}
            />
          </>
        );
      }}
    </ExperienceScreen>
  );
}
