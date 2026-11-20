import { useState } from 'react';
import { clubDay } from '@pucara/shared';
import { ExperienceScreen } from '../../components/member-ui';
import { WeekCalendar } from '../../features/experience/week-calendar';
export default function Agenda() {
  const [day, select] = useState(() => clubDay(new Date()));
  return (
    <ExperienceScreen tab>
      {(data) => <WeekCalendar data={data} day={day} select={select} />}
    </ExperienceScreen>
  );
}
