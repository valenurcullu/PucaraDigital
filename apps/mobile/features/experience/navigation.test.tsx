import { CourtSlots, SlotSummary } from '../padel/availability-screen';
import { WeekCalendar } from './week-calendar';
import React, { type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Slot } from '@radix-ui/react-slot';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import {
  createDemoExperience,
  createDemoPadelReader,
  demoClub,
  padelDayQuery,
  type PadelSlot,
} from '@pucara/shared';
import Home from '../../app/(tabs)/index';
import Club from '../../app/(tabs)/club';
import Agenda from '../../app/(tabs)/agenda';
import ModuleScreen from '../../app/modulos/[id]';
import Match from '../../app/partidos/[id]';
import Notice from '../../app/novedades/[id]';
import Reservation from '../../app/reservas/[id]';
import { Action } from '../../components/member-ui';
import { DateStrip } from '../../components/date-strip';
import { weekOf } from './calendar';
import { useExperience } from './provider';

const harness = vi.hoisted(() => ({
  id: '',
  navigate: vi.fn(),
  controls: new Map<
    string,
    {
      press?: () => void;
      disabled?: boolean;
      busy?: boolean;
      checked?: boolean;
      background?: string;
      pressed?: string;
    }
  >(),
}));
vi.mock('./provider', () => ({ useExperience: vi.fn() }));
vi.mock('expo-router', () => ({
  Link: ({
    href,
    children,
  }: {
    href: unknown;
    children: React.ReactElement;
  }) => (
    <Slot style={undefined} onClick={() => harness.navigate(href)}>
      {children}
    </Slot>
  ),
  useLocalSearchParams: () => ({ id: harness.id }),
  Stack: { Screen: () => null },
}));
vi.mock('../../components/app-icon', () => ({ AppIcon: () => null }));
vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock('react-native-screens/experimental', () => ({
  SafeAreaView: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock('react-native', () => {
  const Box = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  type Style = { backgroundColor?: string };
  type Props = {
    children: ReactNode;
    accessibilityLabel?: string;
    disabled?: boolean;
    accessibilityState?: { busy?: boolean; checked?: boolean };
    onPress?: () => void;
    onClick?: () => void;
    style?:
      | Style
      | ((state: {
          pressed: boolean;
        }) => readonly (Style | false | undefined)[]);
  };
  return {
    View: Box,
    Text: Box,
    Modal: Box,
    ScrollView: Box,
    ActivityIndicator: () => null,
    Platform: { OS: 'ios' },
    StyleSheet: { create: <T,>(x: T) => x },
    useWindowDimensions: () => ({ width: 390, fontScale: 1 }),
    Pressable: (p: Props) => {
      const background = (pressed: boolean) =>
        typeof p.style === 'function'
          ? Object.assign({}, ...p.style({ pressed })).backgroundColor
          : p.style?.backgroundColor;
      if (p.accessibilityLabel)
        harness.controls.set(p.accessibilityLabel, {
          ...p.accessibilityState,
          ...(p.disabled !== undefined ? { disabled: p.disabled } : {}),
          ...(p.onPress || p.onClick
            ? { press: (p.onPress ?? p.onClick)! }
            : {}),
          background: background(false),
          pressed: background(true),
        });
      return <div>{p.children}</div>;
    },
  };
});
const demo = createDemoExperience('2026-12-31');
function render(Screen: React.ComponentType) {
  harness.controls.clear();
  return renderToStaticMarkup(<Screen />);
}
function follow(label: string, route: string, id: string) {
  const control = harness.controls.get(label);
  expect(control?.press, label).toBeTypeOf('function');
  control!.press!();
  expect(harness.navigate).toHaveBeenLastCalledWith({
    pathname: route,
    params: { id },
  });
  harness.id = id;
}
const moduleRoute = '/modulos/[id]';
beforeEach(() => {
  vi.stubGlobal('React', React);
  harness.id = '';
  harness.navigate.mockClear();
  harness.controls.clear();
  vi.mocked(useExperience).mockReturnValue({
    state: { status: 'ready', data: demo },
    reload: vi.fn(),
  });
});
describe('recorridos renderizados con las pantallas y el Slot de enlaces', () => {
  it.each([
    ['Inicio', Home],
    ['Club', Club],
  ] as const)('%s abre la pantalla de disponibilidad', (_, Screen) => {
    expect(render(Screen)).toContain('Reservas');
    const button = harness.controls.get('Ver turnos de pádel');
    expect(button?.background).toBeTruthy();
    expect(button?.pressed).not.toEqual(button?.background);
    follow('Ver turnos de pádel', moduleRoute, 'padel');
    expect(render(ModuleScreen)).toContain('Elegí un día');
    expect(harness.controls.size).toBe(4);
  });
  it('Club → Mis reservas → Ver disponibilidad de pádel', () => {
    render(Club);
    follow('Mis reservas', moduleRoute, 'reservas');
    render(ModuleScreen);
    follow('Ver disponibilidad de pádel', moduleRoute, 'padel');
    expect(render(ModuleScreen)).toContain('Turnos de ejemplo');
  });
  it('abre el resumen del horario elegido y permite volver a la misma consulta', async () => {
    const day = '2027-01-01';
    const reader = createDemoPadelReader(day, 4000000);
    const data = await reader.read(padelDayQuery(demoClub.id, day), {
      aborted: false,
    });
    const court = data.courts[0]!;
    const slots = data.slots.filter((slot) => slot.court_id === court.id);
    let picked: PadelSlot | undefined;
    const list = () =>
      renderToStaticMarkup(
        <CourtSlots
          court={{ ...court, slots }}
          onSelect={(slot) => {
            picked = slot;
          }}
        />,
      );
    const initial = list();
    const key = [...harness.controls.keys()].find(
      (k) => k.includes('09:00') && k.includes(court.name),
    )!;
    harness.controls.get(key)?.press?.();
    expect(picked).toEqual(slots[0]);
    const summary = renderToStaticMarkup(
      <SlotSummary
        court={court.name}
        slot={picked!}
        day={day}
        onClose={() => {
          picked = undefined;
        }}
      />,
    );
    for (const label of [
      'Resumen del turno',
      '09:00',
      '10:30',
      '90 min',
      '40.000',
      court.name,
    ])
      expect(summary).toContain(label);
    harness.controls.get('Volver a los horarios')?.press?.();
    expect(picked).toBeUndefined();
    expect(list()).toBe(initial);
  });
  it('conserva los destinos de partido, fixture, novedad y reserva', () => {
    render(Home);
    follow('Ver partido', '/partidos/[id]', 'hockey-primera');
    expect(render(Match)).toContain('Club del Parque');
    follow('Ver fixture del deporte', moduleRoute, 'hockey');
    expect(render(ModuleScreen)).toContain('Fixture');
    render(Home);
    const news = [...harness.controls.keys()].find((k) =>
      k.includes('Un club para compartir'),
    )!;
    follow(news, '/novedades/[id]', 'jornada-familia');
    expect(render(Notice)).toContain('Un club para compartir');
    harness.id = 'reservas';
    render(ModuleScreen);
    const booking = [...harness.controls.keys()].find((k) =>
      k.startsWith('Pádel · Cancha 1'),
    )!;
    follow(booking, '/reservas/[id]', 'padel-demo');
    expect(render(Reservation)).toContain('Gestionar reserva');
    harness.id = 'no-existe';
    expect(render(ModuleScreen)).toContain('Módulo no encontrado');
  });
  it('Agenda expone los controles semanales y conserva error, reintento y carga', () => {
    expect(render(Agenda)).toContain('Mi agenda');
    for (const name of ['Hoy', 'Semana siguiente', 'Semana anterior'])
      expect(harness.controls.get(name)?.press).toBeTypeOf('function');
    const retry = vi.fn();
    vi.mocked(useExperience).mockReturnValue({
      state: { status: 'error', message: 'Error de prueba' },
      reload: retry,
    });
    expect(render(Agenda)).toContain('Error de prueba');
    harness.controls.get('Volver a intentar')?.press?.();
    expect(retry).toHaveBeenCalledOnce();
    vi.mocked(useExperience).mockReturnValue({
      state: { status: 'loading' },
      reload: retry,
    });
    expect(render(Agenda)).toContain('Preparando tu club');
  });
  it('cambia día y semana con los botones reales y vuelve a Hoy', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-12-31T15:00:00Z'));
      let day = '2026-12-31';
      const show = () => {
        harness.controls.clear();
        return renderToStaticMarkup(
          <WeekCalendar
            data={demo}
            day={day}
            select={(value) => {
              day = value;
            }}
          />,
        );
      };
      expect(show()).toContain('Sin compromisos');
      [...harness.controls.entries()]
        .find(([label]) => label.startsWith('viernes'))?.[1]
        .press?.();
      expect(day).toBe('2027-01-01');
      expect(show()).toContain('Pádel · Cancha 1');
      harness.controls.get('Semana siguiente')?.press?.();
      expect(day).toBe('2027-01-08');
      expect(show()).toContain('Sin compromisos');
      harness.controls.get('Semana anterior')?.press?.();
      expect(day).toBe('2027-01-01');
      show();
      harness.controls.get('Hoy')?.press?.();
      expect(day).toBe('2026-12-31');
    } finally {
      vi.useRealTimers();
    }
  });
  it('permite seleccionar cada día y distingue los que tienen compromisos', () => {
    const select = vi.fn();
    const days = weekOf('2027-01-01');
    renderToStaticMarkup(
      <DateStrip
        days={days}
        selected="2027-01-01"
        onSelect={select}
        marked={new Set(['2027-01-01'])}
      />,
    );
    expect(harness.controls.size).toBe(7);
    const friday = [...harness.controls.entries()].find(([label]) =>
      label.includes('viernes'),
    );
    expect(friday?.[0]).toContain('con compromisos');
    expect(friday?.[1].checked).toBe(true);
    [...harness.controls.values()][0]?.press?.();
    expect(select).toHaveBeenCalledWith(days[0]);
  });
  it('deshabilita la acción durante una carga y expone el estado ocupado', () => {
    renderToStaticMarkup(
      <Action title="Consultar" loading onPress={vi.fn()} />,
    );
    expect(harness.controls.get('Consultar')).toMatchObject({
      disabled: true,
      busy: true,
    });
    renderToStaticMarkup(
      <Action title="Cancelar" disabled variant="destructive" />,
    );
    expect(harness.controls.get('Cancelar')).toMatchObject({
      disabled: true,
      busy: false,
    });
  });
});
