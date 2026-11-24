import { SlotPicker, type SlotCalendar } from '../padel/slot-picker';
import { CardView } from '../../app/(tabs)/carnet';
import Cuenta from '../../app/(tabs)/cuenta';
import { AccountDetail } from '../account/screens';
import MemberTabs from '../../app/(tabs)/_layout';
import { PadelPage } from '../padel/availability-screen';
import { WeekCalendar } from './week-calendar';
import React, { type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Slot } from '@radix-ui/react-slot';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { createDemoExperience } from '@pucara/shared';
import Fixture from '../../app/(tabs)/(inicio)/fixture';
import Home from '../../app/(tabs)/(inicio)/index';
import Club from '../../app/(tabs)/club';
import Agenda from '../../app/(tabs)/agenda';
import ModuleScreen from '../../app/modulos/[id]';
import Match from '../../app/partidos/[id]';
import Notice from '../../app/novedades/[id]';
import { ReservationsPage } from '../padel/reservations-page';
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
      background: string | undefined;
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
  useRouter: () => ({ navigate: harness.navigate }),
  Redirect: () => null,
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
  type Style = { backgroundColor?: string; opacity?: number };
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
    Image: ({ accessibilityLabel }: { accessibilityLabel: string }) => (
      <span>{accessibilityLabel}</span>
    ),
    Text: Box,
    Modal: Box,
    ScrollView: Box,
    ActivityIndicator: () => null,
    Platform: { OS: 'ios' },
    StyleSheet: { create: <T,>(x: T) => x },
    useWindowDimensions: () => ({ width: 390, fontScale: 1 }),
    Pressable: (p: Props) => {
      const computed = (pressed: boolean): Style =>
        typeof p.style === 'function'
          ? Object.assign({}, ...p.style({ pressed }).flat(Infinity))
          : (p.style ?? {});
      if (p.accessibilityLabel)
        harness.controls.set(p.accessibilityLabel, {
          ...p.accessibilityState,
          ...(p.disabled !== undefined ? { disabled: p.disabled } : {}),
          ...(p.onPress || p.onClick
            ? { press: (p.onPress ?? p.onClick)! }
            : {}),
          background: computed(false).backgroundColor,
          pressed: String(computed(true).opacity ?? 1),
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
    preview: vi.fn(),
    reload: vi.fn(),
  });
});
describe('recorridos renderizados con las pantallas y el Slot de enlaces', () => {
  it.each([
    ['Inicio', Home],
    ['Club', Club],
  ] as const)('%s abre la pantalla de disponibilidad', (_, Screen) => {
    render(Screen);
    const booking = harness.controls.get('Reservar pádel');
    expect(booking?.background).toBe('#BC2438');
    expect(Number(booking?.pressed)).toBeLessThan(1);
    booking?.press?.();
    expect(harness.navigate).toHaveBeenLastCalledWith(
      Screen === Home ? '/turnos' : '/club/padel',
    );
    expect(render(PadelPage)).toContain('Elegí el día');
  });
  it('Club abre Mis reservas con acceso a la cancha', () => {
    render(Club);
    harness.controls.get('Mis reservas')?.press?.();
    expect(harness.navigate).toHaveBeenLastCalledWith('/club/reservas');
    expect(render(ReservationsPage)).toContain('Mis reservas');
    harness.controls.get('Reservar pádel')?.press?.();
    expect(harness.navigate).toHaveBeenLastCalledWith('/club/padel');
  });
  it('conserva los destinos de partido, fixture, novedad y reserva', () => {
    render(Home);
    harness.controls.get('Fixture y resultados')?.press?.();
    expect(harness.navigate).toHaveBeenLastCalledWith('/fixture');
    expect(render(Fixture)).toContain('Hockey');
    render(Home);
    follow('Ver partido de hockey', '/partidos/[id]', 'hockey-primera');
    expect(render(Match)).toContain('Club del Parque');
    follow('Ver fixture del deporte', moduleRoute, 'hockey');
    expect(render(ModuleScreen)).toContain('Fixture');
    render(Home);
    const news = [...harness.controls.keys()].find((k) =>
      k.includes('Un club para compartir'),
    )!;
    follow(news, '/novedades/[id]', 'jornada-familia');
    expect(render(Notice)).toContain('Un club para compartir');
    render(ReservationsPage);
    harness.controls.get('Gestionar Pádel 18:30')?.press?.();
    expect(harness.navigate).toHaveBeenLastCalledWith({
      pathname: '/club/padel',
      params: { manage: 'padel-demo' },
    });
    harness.id = 'no-existe';
    expect(render(ModuleScreen)).toContain('Módulo no encontrado');
  });
  it('Agenda expone los controles semanales y conserva error, reintento y carga', () => {
    expect(render(Agenda)).toContain('Agenda');
    for (const name of ['Hoy', 'Semana siguiente', 'Semana anterior'])
      expect(harness.controls.get(name)?.press).toBeTypeOf('function');
    const retry = vi.fn();
    vi.mocked(useExperience).mockReturnValue({
      state: { status: 'error', message: 'Error de prueba' },
      preview: vi.fn(),
      reload: retry,
    });
    expect(render(Agenda)).toContain('Error de prueba');
    harness.controls.get('Volver a intentar')?.press?.();
    expect(retry).toHaveBeenCalledOnce();
    vi.mocked(useExperience).mockReturnValue({
      state: { status: 'loading' },
      preview: vi.fn(),
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
      expect(show()).toContain('Entrenamiento Plantel Superior');
      [...harness.controls.entries()]
        .find(([label]) => label.startsWith('viernes'))?.[1]
        .press?.();
      expect(day).toBe('2027-01-01');
      expect(show()).toContain('Pádel');
      harness.controls.get('Semana siguiente')?.press?.();
      expect(day).toBe('2027-01-08');
      expect(show()).toContain('Día libre');
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
describe('selector reutilizado dentro de Modificar reserva', () => {
  const day = '2027-01-01';
  const row = {
    court_id: 'unica',
    starts_at: day + 'T11:00:00-03:00',
    ends_at: day + 'T12:30:00-03:00',
    price_minor: 4000000,
  };
  const renderEditor = (
    status: SlotCalendar['status'],
    selectedStart?: string,
  ) => {
    const changeDay = vi.fn(),
      pick = vi.fn(),
      onRetry = vi.fn();
    const markup = renderToStaticMarkup(
      <SlotPicker
        calendar={{
          first: day,
          status,
          byDay: new Map([[day, [row]]]),
          onRetry,
        }}
        day={day}
        selectedStart={selectedStart}
        editing
        changeDay={changeDay}
        pick={pick}
      />,
    );
    return { markup, changeDay, pick, onRetry };
  };
  it('ofrece solo los horarios recibidos y comunica el día elegido', () => {
    const { markup, pick, changeDay } = renderEditor('ready');
    expect(markup).toContain('Elegí el nuevo día');
    expect(markup).toContain('Elegí el nuevo horario');
    expect(
      [...harness.controls.keys()].filter((key) => key.startsWith('Elegir ')),
    ).toEqual(['Elegir 11:00']);
    harness.controls.get('Elegir 11:00')?.press?.();
    expect(pick).toHaveBeenCalledWith(row);
    const saturday = [...harness.controls.keys()].find((key) =>
      key.startsWith('sábado'),
    )!;
    harness.controls.get(saturday)?.press?.();
    expect(changeDay).toHaveBeenCalledWith('2027-01-02');
    const selected = renderEditor('ready', row.starts_at);
    harness.controls.get('Elegir 11:00')?.press?.();
    expect(selected.pick).toHaveBeenCalledWith(undefined);
  });
  it('permite reintentar una lectura fallida sin ofrecer horarios', () => {
    const { onRetry, markup } = renderEditor('error');
    expect(markup).toContain('No pudimos cargar los horarios');
    expect(harness.controls.has('Elegir 11:00')).toBe(false);
    harness.controls.get('Reintentar')?.press?.();
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
describe('Carnet y Cuenta familiares', () => {
  it.each([
    ['member-demo', 'Martín', '4821'],
    ['sofia-demo', 'Sofía', '7316'],
    ['tomas-demo', 'Tomás', '8042'],
  ])('muestra el carnet del socio seleccionado %s', (id, name, number) => {
    const html = renderToStaticMarkup(<CardView data={demo} initial={id} />);
    expect(html).toContain(name + ' Ferreyra');
    expect(html).toContain(number);
    expect(html).toContain('QR demostrativo de ' + name);
    expect(html).toContain('todavía no habilita el ingreso');
    if (id !== demo.member.id) expect(html).toContain('sos responsable de');
  });
  it('descarta un acceso directo a un carnet fuera de los vínculos', () => {
    const html = renderToStaticMarkup(
      <CardView data={demo} initial="desconocido" />,
    );
    expect(html).toContain('Carnet no disponible');
    expect(html).not.toContain('SOCIO N°');
  });
  it('abre movimientos y perfiles vinculados desde Cuenta', () => {
    const html = render(Cuenta);
    for (const label of [
      'Martín Ferreyra',
      'Al día',
      'Grupo familiar',
      'Sofía Ferreyra',
      'Tomás Ferreyra',
    ])
      expect(html).toContain(label);
    harness.controls.get('Perfil de Sofía')?.press?.();
    expect(harness.navigate).toHaveBeenLastCalledWith({
      pathname: '/cuenta/[section]',
      params: { section: 'integrante', id: 'sofia-demo' },
    });
    harness.controls.get('Ver movimientos')?.press?.();
    expect(harness.navigate).toHaveBeenLastCalledWith({
      pathname: '/cuenta/[section]',
      params: { section: 'cuenta-corriente' },
    });
    const ledger = renderToStaticMarkup(
      <AccountDetail section="cuenta-corriente" data={demo} />,
    );
    for (const label of [
      'Cuotas',
      'A pagar',
      'Pagada',
      'Débito',
      'Beca deportiva',
      '50',
    ])
      expect(ledger).toContain(label);
  });
  it('abre la agenda y el carnet del menor preservando al titular', () => {
    renderToStaticMarkup(
      <AccountDetail section="integrante" id="tomas-demo" data={demo} />,
    );
    for (const [label, path] of [
      ['Ver agenda', '/agenda'],
      ['Ver carnet', '/carnet'],
    ]) {
      harness.controls.get(label!)?.press?.();
      expect(harness.navigate).toHaveBeenLastCalledWith(
        expect.objectContaining({
          pathname: path,
          params: expect.objectContaining({ person: 'tomas-demo' }),
        }),
      );
    }
    expect(demo.member.name).toBe('Martín Ferreyra');
  });
});
vi.mock('expo-router/native-tabs', () => {
  const Box = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  const Trigger = Object.assign(
    ({ name, children }: { name: string; children: ReactNode }) => (
      <section data-route={name}>{children}</section>
    ),
    { Label: Box, Icon: () => null },
  );
  return { NativeTabs: Object.assign(Box, { Trigger }) };
});
it('mantiene los cinco destinos nativos y sus etiquetas en orden', () => {
  const html = render(MemberTabs);
  expect(
    Array.from(
      html.matchAll(/data-route="([^"]+)"><div>([^<]+)<\/div>/g),
      (m) => [m[1], m[2]],
    ),
  ).toEqual([
    ['(inicio)', 'Inicio'],
    ['agenda', 'Agenda'],
    ['carnet', 'Carnet'],
    ['club', 'Club'],
    ['cuenta', 'Cuenta'],
  ]);
});
