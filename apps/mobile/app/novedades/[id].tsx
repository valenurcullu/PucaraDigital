import { useLocalSearchParams } from 'expo-router';
import {
  Badge,
  Copy,
  ExperienceScreen,
  Heading,
  NavRow,
  StateView,
} from '../../components/member-ui';
import { moduleHref } from '../../features/experience/navigation';
export default function NoticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ExperienceScreen>
      {(data) => {
        const notice = data.notices.find((item) => item.id === id);
        return (
          <>
            {notice ? (
              <>
                <Badge>{notice.category}</Badge>
                <Heading title={notice.title} subtitle={notice.summary} />
                <Copy>{notice.body}</Copy>
              </>
            ) : (
              <StateView
                title="Comunicación no encontrada"
                description="Esta publicación no está disponible."
              />
            )}
            <NavRow
              title="Todas las novedades"
              href={moduleHref('novedades')}
            />
          </>
        );
      }}
    </ExperienceScreen>
  );
}
