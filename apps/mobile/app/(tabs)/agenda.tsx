import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { clubDay } from '@pucara/shared';
import { ExperienceScreen } from '../../components/member-ui';
import { WeekCalendar } from '../../features/experience/week-calendar';
export default function Agenda() {
  const { day, receipt, person, visit } = useLocalSearchParams<{
    day?: string;
    receipt?: string;
    person?: string;
    visit?: string;
  }>();
  const initial =
    day && /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(Date.parse(day))
      ? day
      : clubDay(new Date());
  return (
    <AgendaDay
      key={[receipt, visit, person, initial].join('/')}
      initial={initial}
      person={receipt ? 'self' : (person ?? 'all')}
    />
  );
}
function AgendaDay({ initial, person }: { initial: string; person: string }) {
  const [day, select] = useState(initial);
  return (
    <ExperienceScreen tab showDemoNotice={false}>
      {(data) => (
        <WeekCalendar
          data={data}
          day={day}
          select={select}
          initialPerson={person}
        />
      )}
    </ExperienceScreen>
  );
}
