import { SwipeSeries } from './swipe-series';
import { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  lastSet,
  viewablePeople,
  workoutMetrics,
  type MemberExperience,
  type Routine,
  type Workout,
  type SportsIntent,
} from '@pucara/shared';
import { memberTheme } from '@pucara/design-tokens';
import { MemberStage } from '../experience/member-stage';
import { useExperience } from '../experience/provider';
import { PersonPicker, DemoCaption } from '../experience/identity-ui';
import { AppIcon } from '../../components/app-icon';
import {
  color,
  Command,
  Label,
  layout,
  Tap,
  Sheet,
} from '../../components/handoff-ui';
import { Segments, Notice } from './common';
export function GymScreen() {
  const { person } = useLocalSearchParams<{ person?: string }>();
  return (
    <MemberStage>
      {(data) => (
        <GymContent
          key={person ?? data.member.id}
          data={data}
          initial={person}
        />
      )}
    </MemberStage>
  );
}
export function GymContent({
  data,
  initial,
}: {
  data: MemberExperience;
  initial?: string | undefined;
}) {
  const { preview } = useExperience(),
    router = useRouter();
  const [person, select] = useState(initial ?? data.member.id),
    [day, setDay] = useState('A'),
    [message, tell] = useState('');
  const people = viewablePeople(data, 'activities'),
    routine = data.sports.routines.find((r) => r.personId === person),
    current = data.sports.workouts.find(
      (w) => w.personId === person && !w.finishedAt,
    ),
    training = routine?.days.find((d) => d.id === day) ?? routine?.days[0];
  const history = data.sports.workouts.filter(
    (w) => w.personId === person && w.finishedAt,
  );
  const openHistory = () =>
    router.push({ pathname: '/club/historial', params: { person } });
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={layout.page}
    >
      <PersonPicker
        people={people}
        owner={data.member.id}
        selected={person}
        select={(p) => {
          select(p);
          tell('');
        }}
      />
      {!!message && <Notice>{message}</Notice>}
      {people.some((p) => p.id === person) && routine && training ? (
        <>
          <View
            style={[
              layout.card,
              layout.group,
              { backgroundColor: color.navy, padding: 18 },
            ]}
          >
            <View
              style={{
                alignSelf: 'flex-start',
                padding: 7,
                borderRadius: 6,
                backgroundColor: 'white',
              }}
            >
              <Label role="label">RUTINA ASIGNADA</Label>
            </View>
            <Label role="sheet" ink="white" style={{ fontSize: 24 }}>
              {routine.title}
            </Label>
            <Label role="meta" ink={color.onDarkMuted}>
              {routine.coach} · {routine.frequency}
            </Label>
          </View>
          <Segments
            values={routine.days.map((d) => ({ id: d.id, title: d.name }))}
            selected={training.id}
            onSelect={setDay}
          />
          <View style={[layout.card, { paddingVertical: 2 }]}>
            {training.exercises.map((e, i) => {
              const previous = lastSet(data, person, e);
              return (
                <View key={e.id}>
                  {i > 0 && <View style={layout.line} />}
                  <View style={[layout.row, { minHeight: 64 }]}>
                    <View
                      style={{
                        backgroundColor: color.background,
                        borderRadius: 20,
                        width: 32,
                        height: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Label role="card">{i + 1}</Label>
                    </View>
                    <View style={layout.grow}>
                      <Label role="card">{e.name}</Label>
                      <Label role="meta" ink={color.secondaryText}>
                        {e.sets} × {e.reps}
                      </Label>
                    </View>
                    <Label role="smallNumber">
                      {Number(previous.kg.replace(',', '.'))
                        ? previous.kg + ' kg'
                        : 'PC'}
                    </Label>
                  </View>
                </View>
              );
            })}
          </View>
          <Command
            title={
              current ? 'Continuar entrenamiento' : 'Empezar entrenamiento'
            }
            onPress={() => {
              const id = current?.id ?? 'workout-' + Date.now();
              if (
                !current &&
                !preview(
                  {
                    action: 'start',
                    personId: person,
                    routineId: routine.id,
                    dayId: training.id,
                    id,
                    at: new Date().toISOString(),
                  },
                  data,
                )
              ) {
                tell('No pudimos iniciar. Reintentá.');
                return;
              }
              router.push({
                pathname: '/club/entrenamiento',
                params: { person, id },
              });
            }}
          />
        </>
      ) : (
        <View style={[layout.card, layout.group]}>
          <Label role="section">Todavía no hay una rutina asignada</Label>
          <Label role="meta">
            Tu preparador físico podrá asignarte una rutina.
          </Label>
        </View>
      )}
      <Command
        title={'Historial de entrenamientos · ' + history.length}
        icon="calendar"
        variant="secondary"
        onPress={openHistory}
      />
      <DemoCaption>Rutinas y registros de esta sesión demo</DemoCaption>
    </ScrollView>
  );
}
function elapsed(start: string, now: number) {
  const seconds = Math.max(0, Math.floor((now - Date.parse(start)) / 1000));
  return (
    String(Math.floor(seconds / 60)).padStart(2, '0') +
    ':' +
    String(seconds % 60).padStart(2, '0')
  );
}
export function TrainingScreen() {
  const { person, id } = useLocalSearchParams<{
    person?: string;
    id?: string;
  }>();
  return (
    <MemberStage>
      {(data) => (
        <TrainingContent
          data={data}
          person={person ?? data.member.id}
          id={id ?? ''}
        />
      )}
    </MemberStage>
  );
}
export function TrainingContent({
  data,
  person,
  id,
}: {
  data: MemberExperience;
  person: string;
  id: string;
}) {
  const workout = data.sports.workouts.find(
      (w) => w.id === id && w.personId === person,
    ),
    routine = data.sports.routines.find(
      (r) => r.id === workout?.routineId && r.personId === person,
    );
  if (
    !viewablePeople(data, 'activities').some((p) => p.id === person) ||
    !workout ||
    !routine
  )
    return (
      <View style={layout.page}>
        <Label>Entrenamiento no disponible.</Label>
      </View>
    );
  return (
    <WorkoutEditor
      key={workout.id}
      data={data}
      workout={workout}
      routine={routine}
    />
  );
}
function WorkoutEditor({
  data,
  workout,
  routine,
}: {
  data: MemberExperience;
  workout: Workout;
  routine: Routine;
}) {
  const { preview } = useExperience();
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const narrow = width < 355 || fontScale > 1.35;
  const [now, tick] = useState(() => Date.now()),
    [error, tell] = useState(''),
    [finish, show] = useState(false),
    [menu, setMenu] = useState<{ exerciseId: string; index: number } | null>(
      null,
    ),
    [focused, setFocused] = useState<string | null>(null);
  useEffect(() => {
    if (!workout.finishedAt) {
      const timer = setInterval(() => tick(Date.now()), 1000);
      return () => clearInterval(timer);
    }
  }, [workout.finishedAt]);
  const day = routine.days.find((d) => d.id === workout.dayId)!;
  const metrics = workoutMetrics(workout);
  function change(intent: SportsIntent) {
    if (!preview(intent, data))
      tell('No pudimos actualizar. Revisá los campos y reintentá.');
    else tell('');
  }
  const heading = (
    <View
      style={[
        layout.row,
        {
          padding: 12,
          backgroundColor: color.surface,
          borderBottomWidth: 1,
          borderColor: color.border,
          flexWrap: 'wrap',
          gap: 7,
        },
      ]}
    >
      {[
        [
          'Tiempo',
          elapsed(
            workout.startedAt,
            workout.finishedAt ? Date.parse(workout.finishedAt) : now,
          ),
        ],
        ['Series', metrics.done + '/' + metrics.total],
      ].map(([label, value]) => (
        <View
          key={label}
          style={{ flex: 1, minWidth: 60, alignItems: 'center' }}
        >
          <Label role="label" ink={color.secondaryText}>
            {label}
          </Label>
          <Label role="smallNumber">{value}</Label>
        </View>
      ))}
      {!workout.finishedAt && (
        <Tap
          label="Finalizar"
          onPress={() =>
            metrics.done
              ? show(true)
              : tell('Completá al menos una serie para guardar.')
          }
          style={{
            padding: 12,
            minHeight: 48,
            borderRadius: 14,
            backgroundColor: color.action,
            justifyContent: 'center',
          }}
        >
          <Label role="label" ink="white">
            Finalizar
          </Label>
        </Tap>
      )}
    </View>
  );
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      {heading}
      {workout.removedSet && !workout.finishedAt && (
        <View
          accessibilityLiveRegion="polite"
          style={[layout.row, { padding: 12, backgroundColor: color.navySoft }]}
        >
          <Label role="meta" style={layout.grow}>
            Serie eliminada
          </Label>
          <Tap
            label="Deshacer eliminación"
            onPress={() =>
              change({
                action: 'restore-set',
                personId: workout.personId,
                id: workout.id,
              })
            }
            style={{
              minHeight: 44,
              paddingHorizontal: 14,
              justifyContent: 'center',
              borderRadius: 12,
              backgroundColor: color.surface,
            }}
          >
            <Label role="card">Deshacer</Label>
          </Tap>
        </View>
      )}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={layout.page}
      >
        {!!error && <Notice>{error}</Notice>}
        {workout.finishedAt && <Notice>Entrenamiento guardado · demo</Notice>}
        <Label role="section">{day.name} · Fuerza</Label>
        {!workout.finishedAt && (
          <View style={layout.group}>
            <View style={[layout.row, { minHeight: 48 }]}>
              <Label role="card" style={layout.grow}>
                Registrar pesos
              </Label>
              <Switch
                accessibilityLabel="Registrar pesos"
                value={workout.trackWeights !== false}
                onValueChange={(value) => {
                  setFocused(null);
                  change({
                    action: 'track-weights',
                    personId: workout.personId,
                    id: workout.id,
                    value,
                  });
                }}
                trackColor={{ true: color.navy }}
              />
            </View>
            {metrics.total > 0 && (
              <Command
                title="Marcar todas como hechas"
                variant="secondary"
                onPress={() =>
                  change({
                    action: 'complete-all',
                    personId: workout.personId,
                    id: workout.id,
                  })
                }
              />
            )}
          </View>
        )}
        {workout.exercises.map((e) => {
          const exercise = day.exercises.find((x) => x.id === e.id)!;
          const previous = lastSet(data, workout.personId, exercise);
          return (
            <View
              key={e.id}
              style={[layout.card, layout.group, { padding: narrow ? 10 : 14 }]}
            >
              <Label role="subhead">{exercise.name}</Label>
              <Label role="meta" ink={color.secondaryText}>
                {exercise.sets} × {exercise.reps} · último {previous.kg} kg
              </Label>
              {!narrow && (
                <View style={layout.row}>
                  <Label role="label" style={{ width: 32, fontSize: 10 }}>
                    SERIE
                  </Label>
                  <Label role="label" style={layout.grow}>
                    ANTERIOR
                  </Label>
                  {workout.trackWeights !== false && (
                    <Label
                      role="label"
                      style={{ width: 58, textAlign: 'center' }}
                    >
                      KG
                    </Label>
                  )}
                  <Label
                    role="label"
                    style={{ width: 46, textAlign: 'center' }}
                  >
                    REPS
                  </Label>
                  <View style={{ width: workout.finishedAt ? 44 : 88 }} />
                </View>
              )}
              {e.sets.map((set, index) => (
                <SwipeSeries
                  key={set.id ?? index}
                  disabled={
                    !!workout.finishedAt || focused === (set.id ?? e.id + index)
                  }
                  label={'Eliminar ' + exercise.name + ' serie ' + (index + 1)}
                  onDelete={() =>
                    change({
                      action: 'remove-set',
                      personId: workout.personId,
                      id: workout.id,
                      exerciseId: e.id,
                      index,
                    })
                  }
                >
                  <View
                    style={{
                      padding: 4,
                      borderRadius: 12,
                      gap: 6,
                      backgroundColor: set.done
                        ? color.successBackground
                        : 'transparent',
                    }}
                  >
                    {narrow && (
                      <Label role="meta">
                        Serie {index + 1} · anterior {previous.kg} ×{' '}
                        {previous.reps || '—'}
                      </Label>
                    )}
                    <View style={[layout.row, { gap: 6 }]}>
                      {!narrow && (
                        <>
                          <Label
                            role="smallNumber"
                            style={{ width: 26, textAlign: 'center' }}
                          >
                            {index + 1}
                          </Label>
                          <Label
                            role="meta"
                            ink={color.secondaryText}
                            style={layout.grow}
                          >
                            {previous.kg} × {previous.reps}
                          </Label>
                        </>
                      )}
                      {(workout.trackWeights === false
                        ? (['reps'] as const)
                        : (['kg', 'reps'] as const)
                      ).map((field) => (
                        <View
                          key={field}
                          style={
                            narrow
                              ? { flex: 1 }
                              : { width: field === 'kg' ? 58 : 46 }
                          }
                        >
                          {narrow && (
                            <Label role="label">
                              {field === 'kg' ? 'KG' : 'REPS'}
                            </Label>
                          )}
                          <TextInput
                            accessibilityLabel={
                              exercise.name +
                              ' serie ' +
                              (index + 1) +
                              ' ' +
                              (field === 'kg' ? 'peso' : 'repeticiones')
                            }
                            value={
                              (workout.finishedAt || set.done) &&
                              (field === 'kg'
                                ? set.kgRecorded
                                : set.repsRecorded) === false
                                ? ''
                                : set[field]
                            }
                            placeholder="—"
                            onFocus={() => setFocused(set.id ?? e.id + index)}
                            onBlur={() => setFocused(null)}
                            editable={!workout.finishedAt}
                            selectTextOnFocus
                            keyboardType={
                              field === 'kg' ? 'decimal-pad' : 'number-pad'
                            }
                            returnKeyType="done"
                            style={{
                              minHeight: 44,
                              backgroundColor: set.done ? '#D2E8DA' : '#F1F0EC',
                              borderRadius: 10,
                              textAlign: 'center',
                              fontFamily: memberTheme.font.semibold,
                              fontSize: 18,
                              color: color.text,
                              padding: 4,
                            }}
                            onChangeText={(value) =>
                              change({
                                action: 'set',
                                personId: workout.personId,
                                id: workout.id,
                                exerciseId: e.id,
                                index,
                                field,
                                value,
                              })
                            }
                          />
                        </View>
                      ))}
                      <Tap
                        label={
                          exercise.name +
                          ' serie ' +
                          (index + 1) +
                          (set.done ? ' completada' : ' completar')
                        }
                        selected={set.done}
                        disabled={!!workout.finishedAt}
                        onPress={() =>
                          change({
                            action: 'set',
                            personId: workout.personId,
                            id: workout.id,
                            exerciseId: e.id,
                            index,
                            field: 'done',
                            value: !set.done,
                          })
                        }
                        style={{
                          width: 44,
                          minHeight: 44,
                          borderRadius: 10,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: set.done
                            ? color.successSolid
                            : color.subtle,
                          alignSelf: 'flex-end',
                        }}
                      >
                        <AppIcon
                          name="check"
                          size={25}
                          color={set.done ? 'white' : color.secondaryText}
                        />
                      </Tap>
                      {!workout.finishedAt && (
                        <Tap
                          label={
                            'Opciones de ' +
                            exercise.name +
                            ' serie ' +
                            (index + 1)
                          }
                          onPress={() => setMenu({ exerciseId: e.id, index })}
                          style={{
                            width: 44,
                            minHeight: 44,
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'flex-end',
                          }}
                        >
                          <Label role="section">···</Label>
                        </Tap>
                      )}
                    </View>
                  </View>
                </SwipeSeries>
              ))}
              {!workout.finishedAt && (
                <Tap
                  label={'+ Agregar serie · ' + exercise.name}
                  style={{
                    minHeight: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() =>
                    change({
                      action: 'add-set',
                      personId: workout.personId,
                      id: workout.id,
                      exerciseId: e.id,
                    })
                  }
                >
                  <Label role="card">+ Agregar serie</Label>
                </Tap>
              )}
            </View>
          );
        })}
        <DemoCaption>
          Registros de ejemplo · se conservan durante esta sesión
        </DemoCaption>
      </ScrollView>
      {menu && (
        <Sheet
          title={'Serie ' + (menu.index + 1)}
          onClose={() => setMenu(null)}
        >
          <Command
            title="Eliminar"
            variant="danger"
            onPress={() => {
              change({
                action: 'remove-set',
                personId: workout.personId,
                id: workout.id,
                exerciseId: menu.exerciseId,
                index: menu.index,
              });
              setMenu(null);
            }}
          />
          <Command
            title="Volver"
            variant="secondary"
            onPress={() => setMenu(null)}
          />
        </Sheet>
      )}
      {finish && (
        <Sheet title="Finalizar entrenamiento" onClose={() => show(false)}>
          <Label>{metrics.done} series completadas.</Label>
          <Label role="meta">
            Las series pendientes se conservan en el registro.
          </Label>
          <Command
            title="Guardar entrenamiento"
            onPress={() => {
              if (
                preview(
                  {
                    action: 'finish',
                    personId: workout.personId,
                    id: workout.id,
                    at: new Date().toISOString(),
                  },
                  data,
                )
              ) {
                show(false);
                router.replace({
                  pathname: '/club/historial',
                  params: { person: workout.personId, saved: workout.id },
                });
              } else {
                show(false);
                tell('No pudimos guardar. Reintentá.');
              }
            }}
          />
          <Command
            title="Seguir entrenando"
            variant="secondary"
            onPress={() => show(false)}
          />
        </Sheet>
      )}
    </KeyboardAvoidingView>
  );
}
export function HistoryScreen() {
  const { person, saved } = useLocalSearchParams<{
    person?: string;
    saved?: string;
  }>();
  return (
    <MemberStage>
      {(data) => (
        <HistoryContent
          data={data}
          person={person ?? data.member.id}
          saved={saved}
        />
      )}
    </MemberStage>
  );
}
export function HistoryContent({
  data,
  person,
  saved,
}: {
  data: MemberExperience;
  person: string;
  saved?: string | undefined;
}) {
  const rows = data.sports.workouts
    .filter((w) => w.personId === person && w.finishedAt)
    .slice()
    .reverse();
  const member = viewablePeople(data, 'activities').find(
    (p) => p.id === person,
  );
  if (!member) return <Label>Historial no disponible para este vínculo.</Label>;
  return (
    <ScrollView contentContainerStyle={layout.page}>
      <Label role="section">{member.name}</Label>
      {saved && rows.some((w) => w.id === saved) && (
        <Notice>Entrenamiento guardado · demo</Notice>
      )}
      {rows.length ? (
        rows.map((w) => {
          const metrics = workoutMetrics(w);
          return (
            <Tap
              key={w.id}
              label={'Ver entrenamiento ' + w.id}
              href={{
                pathname: '/club/entrenamiento',
                params: { person, id: w.id },
              }}
              style={[layout.card, layout.group]}
            >
              <Label role="card">
                {new Date(w.startedAt).toLocaleDateString('es-AR')} · Día{' '}
                {w.dayId}
              </Label>
              <Label role="number">{metrics.done} series completadas</Label>
              <Label role="meta" ink={color.action}>
                Ver registro ›
              </Label>
            </Tap>
          );
        })
      ) : (
        <View style={layout.card}>
          <Label role="subhead">Todavía no hay entrenamientos guardados</Label>
          <Label role="meta">Al finalizar tu sesión, aparecerá acá.</Label>
        </View>
      )}
      <DemoCaption />
    </ScrollView>
  );
}
