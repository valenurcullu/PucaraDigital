import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { viewablePeople, clubDay, type MemberExperience } from '@pucara/shared';
import { MemberStage } from '../experience/member-stage';
import { useExperience } from '../experience/provider';
import { PersonPicker, DemoCaption } from '../experience/identity-ui';
import {
  color,
  Command,
  Grid,
  Label,
  layout,
  Pill,
  Sheet,
} from '../../components/handoff-ui';
import { formatTime } from '../experience/navigation';
import { Segments, Notice } from './common';
export function ActivityScreen() {
  const { activity, person } = useLocalSearchParams<{
    activity?: string;
    person?: string;
  }>();
  return (
    <MemberStage>
      {(data) => (
        <ActivityContent
          key={[activity, person].join('/')}
          data={data}
          initial={activity}
          person={person}
        />
      )}
    </MemberStage>
  );
}
export function ActivityContent({
  data,
  initial,
  person,
}: {
  data: MemberExperience;
  initial?: string | undefined;
  person?: string | undefined;
}) {
  const { preview } = useExperience(),
    router = useRouter();
  const [selected, select] = useState(person ?? data.member.id);
  const [id, choose] = useState(initial === 'funcional' ? 'funcional' : 'yoga');
  const [sheet, show] = useState(false),
    [message, tell] = useState('');
  const people = viewablePeople(data, 'activities');
  const allowed = people.some((p) => p.id === selected);
  const activity = data.activities.find((a) => a.id === id);
  if (!activity) return <Label>Actividad no publicada.</Label>;
  if (!allowed)
    return <Label>Actividad no disponible para este vínculo.</Label>;
  const membership = data.sports.enrollments.find(
    (e) => e.activityId === id && e.personId === selected,
  );
  const active =
    membership?.active ??
    (activity.participantId === selected && activity.enrollment === 'active');
  const first = activity.sessions.find(
    (s) => Date.parse(s.startsAt) > Date.parse(data.referenceInstant),
  );
  const second = activity.sessions[1];
  const weekday = (instant: string) =>
    new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      timeZone: 'America/Argentina/Buenos_Aires',
    }).format(new Date(instant));
  const schedule = first
    ? weekday(first.startsAt) + (second ? ' y ' + weekday(second.startsAt) : '')
    : 'Sin clases publicadas';
  function confirm() {
    const ok = preview(
      {
        action: active ? 'unenroll' : 'enroll',
        personId: selected,
        activityId: activity!.id,
        at: new Date().toISOString(),
      },
      data,
    );
    show(false);
    tell(
      ok
        ? active
          ? 'Inscripción cancelada · demo'
          : 'Inscripción confirmada · demo'
        : 'No pudimos actualizar la inscripción. Revisá los cupos y reintentá.',
    );
  }
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={layout.page}
    >
      <PersonPicker
        people={people}
        owner={data.member.id}
        selected={selected}
        select={(p) => {
          select(p);
          tell('');
        }}
      />
      <Segments
        values={[
          { id: 'yoga', title: 'Yoga' },
          { id: 'funcional', title: 'Funcional' },
        ]}
        selected={id}
        onSelect={(p) => {
          choose(p);
          tell('');
        }}
      />
      <View
        style={{
          height: 150,
          borderRadius: 18,
          overflow: 'hidden',
          backgroundColor: color.subtle,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {Array.from({ length: 32 }, (_, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: i * 22 - 80,
              height: 400,
              width: 8,
              backgroundColor: '#E1E0DB',
              transform: [{ rotate: '45deg' }],
            }}
          />
        ))}
        <Label role="label" ink={color.secondaryText}>
          {activity.title}
        </Label>
      </View>
      <View style={layout.between}>
        <Label role="title" style={{ fontSize: 28 }}>
          {activity.title}
        </Label>
        <Pill tone={active ? 'success' : 'neutral'}>
          {active ? 'Inscripto' : 'No inscripto'}
        </Pill>
      </View>
      <Label role="meta" ink={color.secondaryText}>
        {activity.description}
      </Label>
      <Grid columns={2}>
        {[
          ['Días', schedule],
          [
            'Horario',
            first
              ? formatTime(first.startsAt) + ' – ' + formatTime(first.endsAt)
              : 'A confirmar',
          ],
          ['Lugar', activity.location],
          ['Cupos', activity.availablePlaces + ' disponibles'],
        ].map(([title, value]) => (
          <View key={title} style={[layout.card, { gap: 5, minHeight: 78 }]}>
            <Label role="meta" ink={color.secondaryText}>
              {title}
            </Label>
            <Label role={title === 'Horario' ? 'smallNumber' : 'card'}>
              {value}
            </Label>
          </View>
        ))}
      </Grid>
      {!!message && <Notice>{message}</Notice>}
      {active ? (
        <>
          <Notice>
            Estás inscripto · Tus próximas clases están en la Agenda.
          </Notice>
          <Command
            title="Cancelar inscripción"
            variant="outline"
            onPress={() => show(true)}
          />
        </>
      ) : activity.availablePlaces > 0 ? (
        <>
          <Command title="Inscribirme" onPress={() => show(true)} />
          <DemoCaption>
            Al inscribirte, las clases se suman a tu Agenda.
          </DemoCaption>
        </>
      ) : (
        <Notice>Sin cupos disponibles. Revisá más adelante.</Notice>
      )}
      <Command
        title="Ver agenda"
        variant="secondary"
        onPress={() =>
          router.navigate({
            pathname: '/agenda',
            params: {
              person: selected,
              visit: String(Date.now()),
              receipt: '',
              day: first ? clubDay(new Date(first.startsAt)) : '',
            },
          })
        }
      />
      <DemoCaption>Inscripciones demostrativas durante esta sesión</DemoCaption>
      {sheet && (
        <Sheet
          title={
            active
              ? '¿Cancelar inscripción?'
              : 'Inscribirte en ' + activity.title
          }
          onClose={() => show(false)}
        >
          <Label role="card">
            {people.find((p) => p.id === selected)?.name}
          </Label>
          <Label>
            {schedule} · {first ? formatTime(first.startsAt) : ''}
          </Label>
          <Label>
            {active
              ? 'Las clases futuras dejan de aparecer en tu Agenda. Tu historial se conserva.'
              : 'Tus próximas clases se sumarán a Agenda.'}
          </Label>
          <Command
            title={
              active ? 'Sí, cancelar inscripción' : 'Confirmar inscripción'
            }
            variant={active ? 'danger' : 'primary'}
            onPress={confirm}
          />
          <Command
            title="Volver"
            variant="secondary"
            onPress={() => show(false)}
          />
          <DemoCaption />
        </Sheet>
      )}
    </ScrollView>
  );
}
