/** Common gym exercises — LATAM / SmartFit-style seed library for EntrenaLog. */

export interface LibraryExercise {
  name: string
  muscle: string
  type: 'compound' | 'isolation' | 'cardio'
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  { name: 'Press banca', muscle: 'Pecho', type: 'compound' },
  { name: 'Press inclinado con mancuernas', muscle: 'Pecho', type: 'compound' },
  { name: 'Aperturas en polea', muscle: 'Pecho', type: 'isolation' },
  { name: 'Fondos en paralelas', muscle: 'Pecho', type: 'compound' },
  { name: 'Dominadas', muscle: 'Espalda', type: 'compound' },
  { name: 'Jalón al pecho', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo con barra', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo en polea baja', muscle: 'Espalda', type: 'compound' },
  { name: 'Peso muerto rumano', muscle: 'Espalda', type: 'compound' },
  { name: 'Press militar', muscle: 'Hombros', type: 'compound' },
  { name: 'Elevaciones laterales', muscle: 'Hombros', type: 'isolation' },
  { name: 'Face pull', muscle: 'Hombros', type: 'isolation' },
  { name: 'Sentadilla libre', muscle: 'Piernas', type: 'compound' },
  { name: 'Prensa de piernas', muscle: 'Piernas', type: 'compound' },
  { name: 'Peso muerto convencional', muscle: 'Piernas', type: 'compound' },
  { name: 'Zancadas caminando', muscle: 'Piernas', type: 'compound' },
  { name: 'Curl femoral', muscle: 'Piernas', type: 'isolation' },
  { name: 'Extensión de cuádriceps', muscle: 'Piernas', type: 'isolation' },
  { name: 'Hip thrust', muscle: 'Glúteos', type: 'compound' },
  { name: 'Curl de bíceps con barra', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl martillo', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Extensión de tríceps en polea', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Press francés', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Crunch en polea', muscle: 'Core', type: 'isolation' },
  { name: 'Plancha', muscle: 'Core', type: 'isolation' },
  { name: 'Cinta / caminadora', muscle: 'Cardio', type: 'cardio' },
  { name: 'Bicicleta estática', muscle: 'Cardio', type: 'cardio' },
  { name: 'Elíptica', muscle: 'Cardio', type: 'cardio' },
  { name: 'Remo ergómetro', muscle: 'Cardio', type: 'cardio' },
  { name: 'Burpees', muscle: 'Full body', type: 'cardio' },
]

export const WORKOUT_TYPE_LABELS: Record<string, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Piernas',
  full: 'Full body',
  cardio: 'Cardio',
  other: 'Otro',
}

export function filterExercises(query: string, limit = 8): LibraryExercise[] {
  const q = query.trim().toLowerCase()
  if (!q) return EXERCISE_LIBRARY.slice(0, limit)
  return EXERCISE_LIBRARY.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.muscle.toLowerCase().includes(q)
  ).slice(0, limit)
}
