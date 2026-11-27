import type { SportsState } from './sports';
export function createDemoSports(): SportsState {
  return {
    enrollments: [],
    workouts: [],
    routines: [
      {
        id: 'fuerza-semana3',
        personId: 'member-demo',
        title: 'Semana 3 · Fuerza',
        coach: 'Prof. Diego Ramos',
        frequency: '3 días por semana',
        progress: [85, 90, 95, 100],
        days: [
          {
            id: 'A',
            name: 'Día A',
            exercises: [
              {
                id: 'sentadilla',
                name: 'Sentadilla trasera',
                sets: 4,
                reps: 6,
                previousKg: 100,
              },
              {
                id: 'banca',
                name: 'Press de banca',
                sets: 4,
                reps: 8,
                previousKg: 75,
              },
              {
                id: 'peso-muerto',
                name: 'Peso muerto rumano',
                sets: 3,
                reps: 8,
                previousKg: 80,
              },
              {
                id: 'dominadas',
                name: 'Dominadas',
                sets: 3,
                reps: 8,
                previousKg: 0,
              },
            ],
          },
          {
            id: 'B',
            name: 'Día B',
            exercises: [
              {
                id: 'zancadas',
                name: 'Zancadas',
                sets: 3,
                reps: 10,
                previousKg: 20,
              },
              {
                id: 'remo',
                name: 'Remo con barra',
                sets: 4,
                reps: 8,
                previousKg: 50,
              },
              {
                id: 'press',
                name: 'Press militar',
                sets: 3,
                reps: 8,
                previousKg: 35,
              },
            ],
          },
        ],
      },
    ],
  };
}
