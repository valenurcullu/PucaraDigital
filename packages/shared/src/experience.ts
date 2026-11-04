/** Planned destinations, not implemented features or live routes. */
export const plannedExperience = [
  {
    key: 'home',
    number: '01',
    name: 'Inicio',
    summary: 'Lo que importa hoy.',
    detail:
      'Tu próximo entrenamiento, las novedades del club y un resumen de tu cuenta.',
  },
  {
    key: 'agenda',
    number: '02',
    name: 'Agenda',
    summary: 'Hacé lugar para tu club.',
    detail:
      'Entrenamientos, partidos y actividades en un calendario fácil de consultar.',
  },
  {
    key: 'membership',
    number: '03',
    name: 'Carnet',
    summary: 'Siempre con vos.',
    detail:
      'Tu identificación de socio, accesible desde la navegación principal.',
  },
  {
    key: 'activities',
    number: '04',
    name: 'Actividades',
    summary: 'Encontrá tu lugar.',
    detail:
      'Rugby, hockey, gimnasio, yoga y funcional, con la información de cada actividad.',
  },
  {
    key: 'profile',
    number: '05',
    name: 'Perfil',
    summary: 'Tu espacio personal.',
    detail: 'Tus datos y preferencias, organizados en un solo lugar.',
  },
] as const;
