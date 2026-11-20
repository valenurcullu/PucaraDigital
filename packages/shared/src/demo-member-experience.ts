import { requireDemoMode } from './services';
import {
  clubDay,
  type MemberExperience,
  type MemberExperienceReader,
} from './member-experience';

export function createDemoExperienceReader(
  mode?: string,
): MemberExperienceReader {
  requireDemoMode(mode);
  return {
    async read(signal) {
      if (signal.aborted) {
        const error = new Error('Lectura cancelada');
        error.name = 'AbortError';
        throw error;
      }
      return createDemoExperience();
    },
  };
}
export function createDemoExperience(
  day = clubDay(new Date()),
): MemberExperience {
  const base = Date.parse(day + 'T00:00:00Z');
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
    !Number.isFinite(base) ||
    new Date(base).toISOString().slice(0, 10) !== day
  )
    throw new Error('Fecha demo inválida');
  const when = (offset: number, time: string) =>
    new Date(base + offset * 86400000).toISOString().slice(0, 10) +
    'T' +
    time +
    ':00-03:00';
  return {
    mode: 'demo',
    referenceInstant: when(0, '00:00'),
    member: {
      id: 'member-demo',
      name: 'Alex Modelo',
      firstName: 'Alex',
      number: '0000',
      administrativeStatus: 'Activo · ejemplo',
    },
    modules: [
      {
        id: 'reservas',
        title: 'Reservas',
        summary: 'Pádel, quinchos y tus próximos turnos.',
      },
      {
        id: 'padel',
        title: 'Pádel',
        summary:
          'Horarios de ejemplo. La disponibilidad real todavía no está conectada.',
      },
      {
        id: 'quinchos',
        title: 'Quinchos',
        summary: 'Un lugar para compartir en el club.',
      },
      { id: 'rugby', title: 'Rugby', summary: 'Fixture, resultados y videos.' },
      {
        id: 'hockey',
        title: 'Hockey',
        summary: 'Fixture, resultados y videos.',
      },
      {
        id: 'gimnasio',
        title: 'Gimnasio',
        summary: 'Rutinas, cargas y progreso.',
      },
      {
        id: 'yoga',
        title: 'Yoga',
        summary: 'Movimiento, respiración y bienestar.',
      },
      {
        id: 'funcional',
        title: 'Funcional',
        summary: 'Entrená en grupo, a tu ritmo.',
      },
      { id: 'buffet', title: 'Buffet', summary: 'Tu punto de encuentro.' },
      {
        id: 'beneficios',
        title: 'Beneficios',
        summary: 'Más oportunidades para socios.',
      },
      {
        id: 'novedades',
        title: 'Novedades y comunicaciones',
        summary: 'Todo lo que pasa en Pucará.',
      },
      {
        id: 'eventos',
        title: 'Eventos',
        summary: 'Encuentros para toda la familia.',
      },
      {
        id: 'cuenta-corriente',
        title: 'Cuenta corriente',
        summary: 'Situación económica y becas.',
      },
      {
        id: 'familia',
        title: 'Grupo familiar',
        summary: 'Tus vínculos y responsables.',
      },
      { id: 'perfil', title: 'Perfil', summary: 'Tus datos de socio.' },
      {
        id: 'preferencias',
        title: 'Preferencias',
        summary: 'Tu experiencia en el club.',
      },
      { id: 'soporte', title: 'Soporte', summary: 'Estamos para ayudarte.' },
    ],
    groups: [
      { title: 'Reservas', modules: ['padel', 'quinchos'] },
      { title: 'Deportes', modules: ['rugby', 'hockey', 'gimnasio'] },
      { title: 'Actividades', modules: ['yoga', 'funcional'] },
      {
        title: 'Vida en el club',
        modules: ['buffet', 'beneficios', 'novedades', 'eventos'],
      },
    ],
    matches: [
      {
        id: 'rugby-primera',
        sport: 'rugby',
        division: 'Primera',
        opponent: 'Club del Sur',
        venue: 'home',
        startsAt: when(2, '15:30'),
        location: 'Cancha principal · ejemplo',
      },
      {
        id: 'hockey-primera',
        sport: 'hockey',
        division: 'Primera',
        opponent: 'Club del Parque',
        venue: 'away',
        startsAt: when(3, '16:00'),
        location: 'Club del Parque · ejemplo',
      },
    ],
    notices: [
      {
        id: 'jornada-familia',
        category: 'Novedad',
        title: 'Un club para compartir',
        summary: 'Deporte y encuentros para toda la familia.',
        body: 'Esta comunicación es ficticia. En un próximo bloque, el equipo del club podrá publicar las novedades desde el panel administrativo.',
      },
      {
        id: 'comunicado-club',
        category: 'Comunicación',
        title: 'Siempre cerca del club',
        summary: 'Encontrá acá los avisos importantes.',
        body: 'Ejemplo de comunicado institucional. Fechas, sedes y condiciones se publicarán con información oficial del club; este contenido no anuncia un evento real.',
      },
    ],
    reservations: [
      {
        id: 'padel-demo',
        resource: 'padel',
        title: 'Pádel · Cancha 1',
        startsAt: when(1, '18:00'),
        endsAt: when(1, '19:30'),
        location: 'Cancha 1',
        status: 'confirmed',
      },
      {
        id: 'quincho-demo',
        resource: 'quincho',
        title: 'Quincho familiar',
        startsAt: when(3, '12:00'),
        endsAt: when(3, '16:00'),
        location: 'Quincho · ejemplo',
        status: 'pending',
      },
    ],
    activities: [
      {
        id: 'yoga',
        title: 'Yoga',
        description: 'Un espacio para conectar movimiento y respiración.',
        schedule: 'Dos clases de ejemplo · 18:00 a 19:00',
        location: 'Salón · ejemplo',
        availablePlaces: 4,
        enrollment: 'none',
        participantId: 'member-demo',
        sessions: [
          { id: '1', startsAt: when(1, '18:00'), endsAt: when(1, '19:00') },
          { id: '2', startsAt: when(4, '18:00'), endsAt: when(4, '19:00') },
        ],
      },
      {
        id: 'funcional',
        title: 'Funcional',
        description: 'Fuerza y movimiento en una clase compartida.',
        schedule: 'Dos clases de ejemplo · 19:00 a 20:00',
        location: 'Sector entrenamiento · ejemplo',
        availablePlaces: 3,
        enrollment: 'active',
        participantId: 'member-demo',
        sessions: [
          { id: '1', startsAt: when(2, '19:00'), endsAt: when(2, '20:00') },
          { id: '2', startsAt: when(5, '19:00'), endsAt: when(5, '20:00') },
        ],
      },
    ],
    scheduledEvents: [],
    padel: {
      durationMinutes: 90,
      priceMinor: 4000000,
      currency: 'ARS',
      availableCredits: 1,
    },
    account: {
      status: 'Al día · ejemplo',
      scholarship: 'Beca del 100 % · ejemplo',
      amountDueMinor: 0,
      currency: 'ARS',
    },
    family: [
      {
        id: 'minor-demo',
        name: 'Luca Modelo',
        relationship: 'Menor · vínculo ficticio',
        authorization:
          'Responsable autorizado sólo en este ejemplo; no acredita permisos reales.',
      },
    ],
  };
}
