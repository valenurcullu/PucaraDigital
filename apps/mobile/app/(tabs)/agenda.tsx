import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { clubDay } from '@pucara/shared';
import { ExperienceScreen } from '../../components/member-ui';
import { WeekCalendar } from '../../features/experience/week-calendar';
export default function Agenda() {
  const { day, receipt } = useLocalSearchParams<{
    day?: string;
    receipt?: string;
  }>();
  const initial =
    day && /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(Date.parse(day))
      ? day
      : clubDay(new Date());
  return <AgendaDay key={receipt ?? initial} initial={initial} />;
}
function AgendaDay({ initial }: { initial: string }) {
  const [day, select] = useState(initial);
  return (
    <ExperienceScreen tab>
      {(data) => <WeekCalendar data={data} day={day} select={select} />}
    </ExperienceScreen>
  );
}
