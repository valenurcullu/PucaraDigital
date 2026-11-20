import type { ModuleId } from '@pucara/shared';
import type { AppIconName } from '../../components/app-icon';

/** UI labels/icons only. Domain data and permissions remain in the read model. */
export const modulePresentation: Record<
  ModuleId,
  { icon: AppIconName; action: string }
> = {
  reservas: { icon: 'reservations', action: 'Ver mis reservas' },
  padel: { icon: 'padel', action: 'Ver turnos de pádel' },
  quinchos: { icon: 'quincho', action: 'Reservar quincho' },
  rugby: { icon: 'rugby', action: 'Ver fixture' },
  hockey: { icon: 'hockey', action: 'Ver fixture' },
  gimnasio: { icon: 'gym', action: 'Ver rutina' },
  yoga: { icon: 'yoga', action: 'Ver actividad' },
  funcional: { icon: 'training', action: 'Ver actividad' },
  buffet: { icon: 'buffet', action: 'Ver información' },
  beneficios: { icon: 'benefits', action: 'Explorar beneficios' },
  novedades: { icon: 'news', action: 'Leer novedades' },
  eventos: { icon: 'calendar', action: 'Ver eventos' },
  'cuenta-corriente': { icon: 'account', action: 'Ver cuenta corriente' },
  familia: { icon: 'family', action: 'Ver grupo familiar' },
  perfil: { icon: 'person', action: 'Ver perfil' },
  preferencias: { icon: 'settings', action: 'Ver preferencias' },
  soporte: { icon: 'help', action: 'Ver ayuda' },
};
