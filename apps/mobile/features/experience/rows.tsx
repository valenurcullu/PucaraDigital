import type {
  ClubMatch,
  MemberExperience,
  ModuleId,
  PersonalEvent,
} from '@pucara/shared';
import { NavRow, StateView } from '../../components/member-ui';
import { formatDate, moduleHref, targetHref } from './navigation';
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
      detail={module.summary}
      href={moduleHref(id)}
      prominent={prominent}
    />
  ) : null;
}
export function MatchRows({ matches }: { matches: readonly ClubMatch[] }) {
  if (!matches.length)
    return (
      <StateView
        title="Todavía no hay partidos"
        description="Acá aparecerán los próximos encuentros publicados por el club."
      />
    );
  return (
    <>
      {matches.map((match) => (
        <NavRow
          key={match.id}
          title={
            (match.sport === 'rugby' ? 'Rugby' : 'Hockey') +
            ' · ' +
            match.division +
            ' vs. ' +
            match.opponent
          }
          detail={
            (match.venue === 'home' ? 'Local' : 'Visitante') +
            ' · ' +
            formatDate(match.startsAt)
          }
          href={targetHref({ kind: 'match', id: match.id })}
        />
      ))}
    </>
  );
}
export function EventRows({ events }: { events: readonly PersonalEvent[] }) {
  if (!events.length)
    return (
      <StateView
        title="Tu agenda está libre"
        description="Las reservas confirmadas y las clases en las que estés inscripto aparecerán acá."
      />
    );
  return (
    <>
      {events.map((event) => (
        <NavRow
          key={event.id}
          title={event.title}
          detail={formatDate(event.startsAt) + ' · ' + event.location}
          href={targetHref(event.target)}
        />
      ))}
    </>
  );
}
export function NoticeRows({ data }: { data: MemberExperience }) {
  if (!data.notices.length)
    return (
      <StateView
        title="Sin novedades publicadas"
        description="Las próximas comunicaciones del club aparecerán acá."
      />
    );
  return (
    <>
      {data.notices.map((notice) => (
        <NavRow
          key={notice.id}
          title={notice.title}
          detail={notice.category + ' · ' + notice.summary}
          href={targetHref({ kind: 'notice', id: notice.id })}
        />
      ))}
    </>
  );
}
