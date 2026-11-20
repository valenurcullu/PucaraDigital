import type {
  ClubMatch,
  MemberExperience,
  ModuleId,
  PersonalEvent,
} from '@pucara/shared';
import { NavRow, StateView, TileGrid } from '../../components/member-ui';
import { AgendaCard, MatchCard, NoticeCard } from './dashboard-cards';
import { moduleHref } from './navigation';
import { modulePresentation } from './module-presentation';

export function ModuleLink({
  data,
  id,
  prominent = false,
}: {
  data: MemberExperience;
  id: ModuleId;
  prominent?: boolean;
}) {
  const module = data.modules.find((item) => item.id === id);
  return module ? (
    <NavRow
      title={module.title}

      href={moduleHref(id)}
      icon={modulePresentation[id].icon}
      prominent={prominent}
    />
  ) : null;
}
export function MatchRows({
  matches,
  showFixture = true,
}: {
  matches: readonly ClubMatch[];
  showFixture?: boolean;
}) {
  if (!matches.length)
    return (
      <StateView
        title="Próximamente, más partidos"
        description="Los próximos encuentros de Primera aparecerán acá cuando el club los publique."
      />
    );
  return (
    <TileGrid minColumnWidth={280}>
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} showFixture={showFixture} />
      ))}
    </TileGrid>
  );
}
export function EventRows({
  events,
  showDate = true,
}: {
  events: readonly PersonalEvent[];
  showDate?: boolean;
}) {
  if (!events.length)
    return (
      <StateView
        title="Sin compromisos"
        description="Tus reservas confirmadas y clases con inscripción aparecerán acá."
      />
    );
  return (
    <>
      {events.map((event) => (
        <AgendaCard key={event.id} event={event} showDate={showDate} />
      ))}
    </>
  );
}
export function NoticeRows({
  data,
  limit,
}: {
  data: MemberExperience;
  limit?: number;
}) {
  const notices =
    limit === undefined ? data.notices : data.notices.slice(0, limit);
  if (!notices.length)
    return (
      <StateView
        title="Estamos preparando novedades"
        description="Los próximos avisos del club aparecerán acá."
      />
    );
  return (
    <>
      {notices.map((notice, index) => (
        <NoticeCard key={notice.id} notice={notice} featured={index === 0} />
      ))}
    </>
  );
}
