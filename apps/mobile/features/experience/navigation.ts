import type { Href } from 'expo-router';
import {
  clubTimeZone,
  type ExperienceTarget,
  type ModuleId,
} from '@pucara/shared';
export function moduleHref(id: ModuleId): Href {
  return { pathname: '/modulos/[id]', params: { id } };
}
export function targetHref(target: ExperienceTarget): Href {
  switch (target.kind) {
    case 'module':
      return moduleHref(target.id);
    case 'match':
      return { pathname: '/partidos/[id]', params: { id: target.id } };
    case 'notice':
      return { pathname: '/novedades/[id]', params: { id: target.id } };
    case 'reservation':
      return { pathname: '/reservas/[id]', params: { id: target.id } };
  }
}
const dateTime = new Intl.DateTimeFormat('es-AR', {
  timeZone: clubTimeZone,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const timeOnly = new Intl.DateTimeFormat('es-AR', {
  timeZone: clubTimeZone,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});
export function formatDate(value: string) {
  return dateTime.format(new Date(value));
}
export function formatTime(value: string) {
  return timeOnly.format(new Date(value));
}
export function formatMoney(minor: number) {
  return currency.format(minor / 100);
}
