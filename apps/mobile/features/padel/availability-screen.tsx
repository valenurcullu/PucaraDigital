import { TurnReview } from './turn-review';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  clubDay,
  createDemoPadelReader,
  demoClub,
  offsetClubDay,
  type MemberExperience,
  type PadelSlot,
} from '@pucara/shared';
import { AppIcon } from '../../components/app-icon';
import {
  color,
  Command,
  DateBlock,
  Grid,
  Label,
  layout,
  longDate,
  Pill,
  Sheet,
  shortDate,
  Tap,
} from '../../components/handoff-ui';
import { MemberStage } from '../experience/member-stage';
import { formatMoney, formatTime } from '../experience/navigation';
import { useExperience } from '../experience/provider';
import { loadAvailability, type AvailabilityState } from './availability-model';
import { activeRows, CreditInfo, ReservationRows } from './reservations-page';

const dayText = (d: string) => longDate.format(new Date(d));
const range = (start: string, end: string) =>
  formatTime(start) + ' – ' + formatTime(end);
const month = new Intl.DateTimeFormat('es-AR', {
  month: 'long',
  timeZone: 'UTC',
});
function monthRange(start: string, end: string) {
  const a = month.format(new Date(start)),
    b = month.format(new Date(end));
  return a === b ? a : a + ' – ' + b;
}
export function PadelPage() {
  const { manage } = useLocalSearchParams<{ manage?: string }>();
  return (
    <MemberStage>
      {(data) => (
        <PadelFlow key={manage ?? 'picker'} data={data} manage={manage} />
      )}
    </MemberStage>
  );
}
type Panel = 'manage' | 'review' | 'cancel' | 'success' | null;
export function PadelFlow({
  data,
  manage,
}: {
  data: MemberExperience;
  manage?: string | undefined;
}) {
  const router = useRouter(),
    { preview } = useExperience();
  const first = clubDay(new Date(data.referenceInstant));
  const days = Array.from({ length: 14 }, (_, i) => offsetClubDay(first, i));
  const [day, setDay] = useState(() => offsetClubDay(first, 1)),
    [slot, pick] = useState<PadelSlot>(),
    [panel, show] = useState<Panel>(manage ? 'manage' : null);
  const [managed, setManaged] = useState(manage),
    [editing, edit] = useState<string>(),
    [method, pay] = useState<'credit' | 'pay'>('pay'),
    [message, tell] = useState(''),
    [retry, reload] = useState(0);
  const [availability, publish] = useState<AvailabilityState>({
    status: 'loading',
  });
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => tell(''), 2600);
      return () => clearTimeout(timer);
    }
  }, [message]);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(() => {
    const controller = new AbortController();
    const reader = createDemoPadelReader(
      first,
      data.padel.priceMinor,
      process.env.EXPO_PUBLIC_DATA_MODE,
      data.reservations
        .filter(
          (r) =>
            r.resource === 'padel' &&
            r.status === 'confirmed' &&
            r.id !== editing,
        )
        .map((r) => r.startsAt),
    );
    void loadAvailability(
      reader,
      {
        p_club: demoClub.id,
        p_from: data.referenceInstant,
        p_until: offsetClubDay(first, 14) + 'T00:00:00-03:00',
      },
      controller.signal,
      publish,
    );
    return () => controller.abort();
  }, [
    first,
    data.padel.priceMinor,
    data.reservations,
    data.referenceInstant,
    retry,
    editing,
  ]);
  const rows = activeRows(data).filter((r) => r.resource === 'padel'),
    old = rows.find((r) => r.id === managed),
    original = rows.find((r) => r.id === editing);
  const byDay = useMemo(() => {
    const grouped = new Map<string, PadelSlot[]>();
    if (availability.status === 'ready')
      for (const court of availability.courts)
        for (const row of court.slots) {
          const key = clubDay(new Date(row.starts_at));
          const existing = grouped.get(key);
          if (existing) existing.push(row);
          else grouped.set(key, [row]);
        }
    return grouped;
  }, [availability]);
  const forDay = (date: string) => byDay.get(date) ?? [];
  const available = forDay(day),
    next = days.find((d) => d > day && forDay(d).length);
  const changeDay = (d: string) => {
    setDay(d);
    pick(undefined);
    tell('');
  };
  const reset = () => {
    show(null);
    edit(undefined);
    pick(undefined);
  };
  function confirm() {
    if (!slot) return;
    const ok = preview(
      editing
        ? { action: 'move', id: editing, slot }
        : { action: 'book', slot, method, id: 'preview-' + Date.now() },
      data,
    );
    if (!ok) {
      reset();
      tell('El turno cambió. Volvé a elegir un horario.');
      return;
    }
    if (editing) {
      reset();
      tell('Reserva modificada · demo');
    } else show('success');
  }
  function cancel() {
    if (!old) return;
    if (preview({ action: 'cancel', id: old.id, exampleEligible: true }, data))
      tell('Turno cancelado · +1 crédito demo');
    else tell('La reserva ya cambió. Revisá Mis reservas.');
    reset();
  }
  const heading =
    panel === 'manage'
      ? 'Pádel'
      : panel === 'cancel'
        ? '¿Cancelar este turno?'
        : panel === 'success'
          ? '¡Turno reservado!'
          : editing
            ? 'Confirmá el cambio'
            : 'Confirmá tu turno';
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scroll}
        contentContainerStyle={layout.page}
        contentInsetAdjustmentBehavior="never"
      >
        {original && (
          <View
            style={[
              layout.card,
              layout.row,
              { backgroundColor: color.navySoft },
            ]}
          >
            <AppIcon name="edit" />
            <View style={layout.grow}>
              <Label role="card">
                Modificando {shortDate.format(new Date(original.startsAt))} ·{' '}
                {formatTime(original.startsAt)}
              </Label>
              <Label role="meta">
                Tu turno actual se mantiene hasta que confirmes.
              </Label>
            </View>
            <Tap
              label="Salir de la modificación"
              onPress={reset}
              style={{
                paddingHorizontal: 12,
                minHeight: 44,
                justifyContent: 'center',
                borderRadius: 10,
                backgroundColor: color.surface,
              }}
            >
              <Label role="label">Salir</Label>
            </Tap>
          </View>
        )}
        <View style={layout.between}>
          <View style={layout.grow}>
            <Label role="card">Cancha de pádel</Label>
            <Label role="meta" ink={color.secondaryText}>
              Turnos de {data.padel.durationMinutes} min ·{' '}
              {formatMoney(data.padel.priceMinor)}
            </Label>
          </View>
          <CreditInfo count={data.padel.availableCredits} />
        </View>
        {!!message && (
          <View
            accessibilityLiveRegion="polite"
            style={[layout.card, { backgroundColor: color.navy }]}
          >
            <Label role="card" ink="white">
              {message}
            </Label>
          </View>
        )}
        <View style={layout.group}>
          <View style={layout.between}>
            <Label role="subhead">Elegí el día</Label>
            <Label role="meta" ink={color.secondaryText}>
              {monthRange(first, days[13]!)}
            </Label>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {days.map((d) => {
              const on = d === day,
                date = new Date(d + 'T12:00:00-03:00'),
                count = forDay(d).length;
              const countLabel =
                availability.status === 'loading'
                  ? '…'
                  : availability.status === 'error'
                    ? '—'
                    : count
                      ? count + ' libres'
                      : 'Completo';
              return (
                <Tap
                  key={d}
                  label={dayText(date.toISOString()) + ', ' + countLabel}
                  selected={on}
                  onPress={() => changeDay(d)}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    minWidth: 58,
                    minHeight: 80,
                    paddingHorizontal: 5,
                    borderRadius: 14,
                    backgroundColor: on ? color.navy : color.surface,
                    borderWidth: 1,
                    borderColor: on ? color.navy : color.hairline,
                  }}
                >
                  <Label role="label" ink={on ? 'white' : color.secondaryText}>
                    {d === first
                      ? 'Hoy'
                      : shortDate
                          .format(date)
                          .split(' ')[0]
                          ?.replace(/[.,]/g, '')
                          .toUpperCase()}
                  </Label>
                  <Label role="day" ink={on ? 'white' : color.text}>
                    {Number(d.slice(-2))}
                  </Label>
                  <Label
                    role="label"
                    style={{ fontSize: 10 }}
                    ink={on ? 'white' : count ? color.success : color.tertiary}
                  >
                    {countLabel}
                  </Label>
                </Tap>
              );
            })}
          </ScrollView>
        </View>
        <View style={layout.group}>
          <View style={layout.between}>
            <Label role="subhead">Elegí el horario</Label>
            {availability.status === 'ready' && (
              <Label role="meta" ink={color.secondaryText}>
                {available.length} disponibles
              </Label>
            )}
          </View>
          {availability.status === 'loading' ? (
            <View
              accessible
              accessibilityLabel="Cargando horarios"
              accessibilityState={{ busy: true }}
              style={layout.row}
            >
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    minHeight: 62,
                    borderRadius: 14,
                    backgroundColor: color.subtle,
                  }}
                />
              ))}
            </View>
          ) : availability.status === 'error' ? (
            <View
              style={[
                layout.card,
                layout.group,
                { backgroundColor: color.errorBackground },
              ]}
            >
              <AppIcon name="error" color={color.error} />
              <Label>No pudimos cargar los horarios.</Label>
              <Command
                title="Reintentar"
                variant="secondary"
                onPress={() => reload((x) => x + 1)}
              />
            </View>
          ) : available.length ? (
            <Grid columns={3}>
              {available.map((s) => {
                const active = s.starts_at === slot?.starts_at;
                return (
                  <Tap
                    key={s.starts_at}
                    label={'Elegir ' + formatTime(s.starts_at)}
                    selected={active}
                    onPress={() => pick(active ? undefined : s)}
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 62,
                      padding: 5,
                      borderRadius: 14,
                      borderWidth: active ? 2 : 1,
                      borderColor: active ? color.action : color.border,
                      backgroundColor: active ? color.action : color.surface,
                    }}
                  >
                    <Label role="number" ink={active ? 'white' : color.text}>
                      {formatTime(s.starts_at)}
                    </Label>
                    <Label
                      role="meta"
                      style={{ fontSize: 11 }}
                      ink={active ? 'white' : color.secondaryText}
                    >
                      hasta {formatTime(s.ends_at)}
                    </Label>
                  </Tap>
                );
              })}
            </Grid>
          ) : (
            <View style={[layout.card, layout.group]}>
              <Label role="card">Sin turnos disponibles</Label>
              <Label role="meta">Probá con otra fecha.</Label>
              {next && (
                <Command
                  title="Ver próximo día disponible"
                  variant="secondary"
                  onPress={() => changeDay(next)}
                />
              )}
            </View>
          )}
        </View>
        <ReservationRows
          rows={rows}
          manage={(id) => {
            setManaged(id);
            show('manage');
          }}
        />
        <Label role="meta" ink={color.secondaryText}>
          DEMO · Horarios ficticios. Los cambios duran solo esta sesión.
        </Label>
      </ScrollView>
      {slot && panel !== 'success' && (
        <View
          style={[
            layout.row,
            {
              backgroundColor: color.surface,
              padding: 12,
              borderTopWidth: 1,
              borderColor: color.border,
            },
          ]}
        >
          <View style={layout.grow}>
            <Label role="label">{dayText(slot.starts_at)}</Label>
            <Label role="number">{range(slot.starts_at, slot.ends_at)}</Label>
          </View>
          <Command
            title={editing ? 'Revisar cambio' : 'Continuar'}
            onPress={() => {
              if (
                original &&
                Date.parse(original.startsAt) === Date.parse(slot.starts_at)
              ) {
                tell('Elegí un horario diferente al original.');
                return;
              }
              pay(data.padel.availableCredits ? 'credit' : 'pay');
              show('review');
            }}
          />
        </View>
      )}
      {panel && (
        <Sheet
          title={heading}
          showTitle={panel !== 'success'}
          onClose={() => (panel === 'success' ? reset() : show(null))}
        >
          {panel === 'manage' &&
            (!old ? (
              <Label>Esta reserva ya no está disponible.</Label>
            ) : (
              <>
                <Pill tone="success">Confirmada · demo</Pill>
                <View
                  style={[
                    layout.card,
                    layout.row,
                    { backgroundColor: color.background },
                  ]}
                >
                  <DateBlock instant={old.startsAt} />
                  <View style={layout.grow}>
                    <Label role="meta">{dayText(old.startsAt)}</Label>
                    <Label role="number">
                      {range(old.startsAt, old.endsAt)}
                    </Label>
                    <Label role="meta" ink={color.secondaryText}>
                      Cancha de pádel · {data.padel.durationMinutes} min ·{' '}
                      {old.demoPayment === 'credit'
                        ? 'Con 1 crédito'
                        : 'Pago simulado'}
                    </Label>
                  </View>
                </View>
                <Command
                  title="Modificar día u horario"
                  icon="edit"
                  variant="navy"
                  onPress={() => {
                    edit(old.id);
                    changeDay(clubDay(new Date(old.startsAt)));
                    show(null);
                    scroll.current?.scrollTo({ y: 0, animated: true });
                  }}
                />
                <Command
                  title="Cancelar reserva"
                  icon="cancel"
                  variant="outline"
                  onPress={() => show('cancel')}
                />
                <Command
                  title="Cerrar"
                  variant="quiet"
                  onPress={() => show(null)}
                />
              </>
            ))}
          {panel === 'cancel' && old && (
            <>
              <Label>
                {dayText(old.startsAt)} · {formatTime(old.startsAt)}
              </Label>
              <View
                style={[
                  layout.card,
                  { backgroundColor: color.warningBackground },
                ]}
              >
                <Label>
                  El horario queda libre. La política del club está pendiente de
                  definición. En esta demo recibís 1 crédito para otro turno.
                </Label>
              </View>
              <Command title="Sí, cancelar" variant="danger" onPress={cancel} />
              <Command
                title="No, mantener reserva"
                variant="secondary"
                onPress={() => show('manage')}
              />
            </>
          )}
          {panel === 'review' && slot && (
            <TurnReview
              slot={slot}
              original={original}
              credits={data.padel.availableCredits}
              method={method}
              pay={pay}
              confirm={confirm}
              changeTime={() => show(null)}
            />
          )}
          {panel === 'success' && slot && (
            <>
              <View style={{ alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: color.successBackground,
                    borderRadius: 36,
                  }}
                >
                  <AppIcon name="check" size={48} color={color.successSolid} />
                </View>
                <Label role="sheet">¡Turno reservado!</Label>
              </View>
              <Label role="card" style={{ textAlign: 'center' }}>
                {dayText(slot.starts_at)}
              </Label>
              <Label
                role="number"
                style={{ fontSize: 30, textAlign: 'center' }}
              >
                {range(slot.starts_at, slot.ends_at)}
              </Label>
              <Label>
                {method === 'credit'
                  ? 'Con 1 crédito demo · Ya está en tu Agenda.'
                  : 'Pago simulado · Ya está en tu Agenda.'}
              </Label>
              <Command title="Listo" onPress={reset} />
              <Command
                title="Ver en Agenda"
                variant="secondary"
                onPress={() => {
                  const day = clubDay(new Date(slot.starts_at));
                  reset();
                  router.navigate({
                    pathname: '/agenda',
                    params: { day, receipt: String(Date.now()) },
                  });
                }}
              />
            </>
          )}
        </Sheet>
      )}
    </View>
  );
}
