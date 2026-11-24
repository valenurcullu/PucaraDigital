import { useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  clubDay,
  offsetClubDay,
  viewablePeople,
  type AgendaItem,
  type AgendaStatus,
  type MemberExperience,
} from '@pucara/shared';
import { AppIcon } from '../../components/app-icon';
import {
  color,
  Command,
  Label,
  layout,
  Pill,
  Sheet,
  Tap,
} from '../../components/handoff-ui';
import { DateStrip } from '../../components/date-strip';
import {
  calendarMonth,
  dayLabels,
  personalWeek,
  mondayOf,
  weekOf,
} from './calendar';
import { DemoCaption, PersonPicker } from './identity-ui';
import { formatTime, targetHref } from './navigation';
const states = {
  confirmed: ['Confirmada', 'success', color.successSolid],
  pending: ['Pendiente', 'warning', color.warningBar],
  enrolled: ['Inscripto', 'success', color.successSolid],
  training: ['Grupal', 'blue', color.navy],
  called: ['Convocado', 'accent', color.action],
  cancelled: ['Cancelado', 'neutral', color.secondaryText],
} as const satisfies Record<AgendaStatus, readonly [string, string, string]>;
function status(event: AgendaItem) {
  return states[event.status ?? 'training'];
}
export function WeekCalendar({
  data,
  day,
  select,
  initialPerson = 'all',
}: {
  data: MemberExperience;
  day: string;
  select: (day: string) => void;
  initialPerson?: string;
}) {
  const people = viewablePeople(data, 'agenda');
  const [filter, setFilter] = useState(
    initialPerson === 'self' ? data.member.id : initialPerson,
  );
  const [opened, open] = useState<AgendaItem | null>(null);
  const monday = mondayOf(day);
  const days = useMemo(() => weekOf(monday), [monday]);
  const byDay = useMemo(
    () => personalWeek(data, days, filter),
    [data, days, filter],
  );
  const events = byDay.get(day) ?? [];
  const allowed = filter === 'all' || people.some((p) => p.id === filter);
  const today = clubDay(new Date());
  const marks = new Set(days.filter((d) => byDay.get(d)?.length));
  return (
    <>
      <View style={layout.between}>
        <Label role="title">Agenda</Label>
        <Tap
          label="Hoy"
          onPress={() => select(today)}
          style={{
            paddingHorizontal: 16,
            minHeight: 44,
            justifyContent: 'center',
            borderRadius: 22,
            borderWidth: 1,
            borderColor: day === today ? color.border : color.navy,
            backgroundColor: color.surface,
          }}
        >
          <Label role="label">Hoy</Label>
        </Tap>
      </View>
      <PersonPicker
        all
        people={people}
        owner={data.member.id}
        selected={filter}
        select={setFilter}
      />
      <View style={[layout.card, { borderRadius: 20, padding: 8 }]}>
        <View style={[layout.row, { paddingLeft: 8 }]}>
          <Label role="card" style={[layout.grow, { textTransform: 'none' }]}>
            {calendarMonth(day)}
          </Label>
          {[-7, 7].map((n) => (
            <Tap
              key={n}
              label={n < 0 ? 'Semana anterior' : 'Semana siguiente'}
              onPress={() => select(offsetClubDay(day, n))}
              style={{
                width: 44,
                minHeight: 44,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ rotate: n < 0 ? '180deg' : '0deg' }],
              }}
            >
              <AppIcon name="chevron" size={18} color={color.action} />
            </Tap>
          ))}
        </View>
        <DateStrip
          days={days}
          selected={day}
          onSelect={select}
          marked={marks}
        />
      </View>
      <View style={layout.group}>
        <View style={layout.between}>
          <Label
            role="subhead"
            style={{ flexShrink: 1, textTransform: 'capitalize' }}
          >
            {dayLabels(day)
              .full.replace(/^./, (l) => l.toUpperCase())
              .replace(',', '')}
            {today === day ? ' · Hoy' : ''}
          </Label>
          <Label role="meta" ink={color.secondaryText}>
            {events.length} {events.length === 1 ? 'actividad' : 'actividades'}
          </Label>
        </View>
        {events.map((e) => {
          const [tag, tone, bar] = status(e);
          const who = people.find((p) => p.id === e.personId);
          const child = who && who.id !== data.member.id;
          return (
            <Tap
              key={e.personId + e.id}
              label={
                e.title +
                ' · ' +
                (who?.firstName ?? '') +
                ' · ' +
                formatTime(e.startsAt)
              }
              {...(!child && (e.kind === 'reservation' || e.kind === 'activity')
                ? { href: targetHref(e.target) }
                : { onPress: () => open(e) })}
              style={[
                layout.card,
                layout.row,
                { minHeight: 76, flexWrap: 'wrap', gap: 8 },
              ]}
            >
              <View style={{ minWidth: 50 }}>
                <Label role="number" style={{ fontSize: 21 }}>
                  {formatTime(e.startsAt)}
                </Label>
                <Label
                  role="smallNumber"
                  ink={color.secondaryText}
                  style={{ fontSize: 15 }}
                >
                  {formatTime(e.endsAt)}
                </Label>
              </View>
              <View
                style={{
                  width: 3,
                  borderRadius: 2,
                  alignSelf: 'stretch',
                  backgroundColor: bar,
                }}
              />
              <View style={[layout.grow, { minWidth: 76, gap: 3 }]}>
                <Label role="card">{e.title}</Label>
                <View style={[layout.row, { gap: 3 }]}>
                  <AppIcon
                    name="location"
                    size={13}
                    color={color.secondaryText}
                  />
                  <Label
                    role="meta"
                    ink={color.secondaryText}
                    style={{ flexShrink: 1 }}
                  >
                    {e.location}
                  </Label>
                </View>
              </View>
              <View style={{ gap: 4, alignItems: 'center' }}>
                <Pill tone={tone}>{tag}</Pill>
                {filter === 'all' && child && (
                  <Label role="label">{who.firstName.toUpperCase()}</Label>
                )}
              </View>
            </Tap>
          );
        })}
        {!allowed && <Label>Agenda no disponible para este vínculo.</Label>}
        {allowed && !events.length && (
          <View style={[layout.card, layout.group]}>
            <Label role="subhead">Día libre</Label>
            <Label role="meta">
              {filter === 'all' || filter === data.member.id
                ? 'No tenés compromisos este día.'
                : 'Sin compromisos para esta persona.'}
            </Label>
            {(filter === 'all' || filter === data.member.id) && (
              <Tap
                label="Reservar pádel"
                href="/turnos"
                style={{
                  minHeight: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                  backgroundColor: color.navySoft,
                }}
              >
                <Label role="card">Reservar pádel</Label>
              </Tap>
            )}
          </View>
        )}
      </View>
      <DemoCaption />
      {opened && (
        <Sheet title={opened.title} onClose={() => open(null)}>
          <Pill tone={status(opened)[1]}>{status(opened)[0]}</Pill>
          <Label role="card">
            {people.find((p) => p.id === opened.personId)?.name}
          </Label>
          <Label>
            {dayLabels(clubDay(new Date(opened.startsAt))).full} ·{' '}
            {formatTime(opened.startsAt)} – {formatTime(opened.endsAt)}
          </Label>
          <Label>{opened.location}</Label>
          <DemoCaption />
          <Command
            title="Cerrar"
            variant="secondary"
            onPress={() => open(null)}
          />
        </Sheet>
      )}
    </>
  );
}
