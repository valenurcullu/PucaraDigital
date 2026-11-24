import { ScrollView, View } from 'react-native';
import { offsetClubDay, type PadelSlot } from '@pucara/shared';
import { AppIcon } from '../../components/app-icon';
import {
  color,
  Command,
  Grid,
  Label,
  layout,
  longDate,
  shortDate,
  Tap,
} from '../../components/handoff-ui';
import { formatTime } from '../experience/navigation';
import type { AvailabilityState } from './availability-model';
const month = new Intl.DateTimeFormat('es-AR', {
  month: 'long',
  timeZone: 'UTC',
});
function monthRange(start: string, end: string) {
  const a = month.format(new Date(start)),
    b = month.format(new Date(end));
  return a === b ? a : a + ' – ' + b;
}

export interface SlotCalendar {
  first: string;
  status: AvailabilityState['status'];
  byDay: ReadonlyMap<string, readonly PadelSlot[]>;
  onRetry: () => void;
}
export function SlotPicker({
  calendar,
  day,
  selectedStart,
  changeDay,
  pick,
  editing = false,
}: {
  calendar: SlotCalendar;
  day: string;
  selectedStart: string | undefined;
  changeDay: (day: string) => void;
  pick: (slot: PadelSlot | undefined) => void;
  editing?: boolean;
}) {
  const { first, status, byDay, onRetry } = calendar;
  const days = Array.from({ length: 14 }, (_, i) => offsetClubDay(first, i));
  const forDay = (date: string) => byDay.get(date) ?? [];
  const available = forDay(day),
    next = days.find((d) => d > day && forDay(d).length);
  return (
    <>
      <View style={layout.group}>
        <View style={layout.between}>
          <Label role="subhead">
            {editing ? 'Elegí el nuevo día' : 'Elegí el día'}
          </Label>
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
              status === 'loading'
                ? '…'
                : status === 'error'
                  ? '—'
                  : count
                    ? count + ' libres'
                    : 'Completo';
            return (
              <Tap
                key={d}
                label={longDate.format(date) + ', ' + countLabel}
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
          <Label role="subhead">
            {editing ? 'Elegí el nuevo horario' : 'Elegí el horario'}
          </Label>
          {status === 'ready' && (
            <Label role="meta" ink={color.secondaryText}>
              {available.length} disponibles
            </Label>
          )}
        </View>
        {status === 'loading' ? (
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
        ) : status === 'error' ? (
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
              onPress={() => onRetry()}
            />
          </View>
        ) : available.length ? (
          <Grid columns={3}>
            {available.map((s) => {
              const active = s.starts_at === selectedStart;
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
    </>
  );
}
