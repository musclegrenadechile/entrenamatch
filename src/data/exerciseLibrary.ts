/** Common gym exercises — LATAM / SmartFit-style library for EntrenaLog. */

export interface LibraryExercise {
  name: string
  muscle: string
  type: 'compound' | 'isolation' | 'cardio'
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // Pecho
  { name: 'Press banca', muscle: 'Pecho', type: 'compound' },
  { name: 'Press banca inclinado', muscle: 'Pecho', type: 'compound' },
  { name: 'Press banca declinado', muscle: 'Pecho', type: 'compound' },
  { name: 'Press inclinado con mancuernas', muscle: 'Pecho', type: 'compound' },
  { name: 'Press plano con mancuernas', muscle: 'Pecho', type: 'compound' },
  { name: 'Aperturas con mancuernas', muscle: 'Pecho', type: 'isolation' },
  { name: 'Aperturas en polea', muscle: 'Pecho', type: 'isolation' },
  { name: 'Cruces en polea', muscle: 'Pecho', type: 'isolation' },
  { name: 'Fondos en paralelas', muscle: 'Pecho', type: 'compound' },
  { name: 'Fondos en banco', muscle: 'Pecho', type: 'compound' },
  { name: 'Pullover con mancuerna', muscle: 'Pecho', type: 'isolation' },
  { name: 'Press en máquina pecho', muscle: 'Pecho', type: 'compound' },
  // Espalda
  { name: 'Dominadas', muscle: 'Espalda', type: 'compound' },
  { name: 'Dominadas supinas', muscle: 'Espalda', type: 'compound' },
  { name: 'Jalón al pecho', muscle: 'Espalda', type: 'compound' },
  { name: 'Jalón agarre neutro', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo con barra', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo con mancuerna', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo en polea baja', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo en T', muscle: 'Espalda', type: 'compound' },
  { name: 'Remo en máquina', muscle: 'Espalda', type: 'compound' },
  { name: 'Peso muerto rumano', muscle: 'Espalda', type: 'compound' },
  { name: 'Peso muerto convencional', muscle: 'Espalda', type: 'compound' },
  { name: 'Pulldown straight arm', muscle: 'Espalda', type: 'isolation' },
  { name: 'Encogimientos con barra', muscle: 'Espalda', type: 'isolation' },
  // Hombros
  { name: 'Press militar', muscle: 'Hombros', type: 'compound' },
  { name: 'Press Arnold', muscle: 'Hombros', type: 'compound' },
  { name: 'Press con mancuernas sentado', muscle: 'Hombros', type: 'compound' },
  { name: 'Elevaciones laterales', muscle: 'Hombros', type: 'isolation' },
  { name: 'Elevaciones frontales', muscle: 'Hombros', type: 'isolation' },
  { name: 'Pájaros / reverse fly', muscle: 'Hombros', type: 'isolation' },
  { name: 'Face pull', muscle: 'Hombros', type: 'isolation' },
  { name: 'Remo al mentón', muscle: 'Hombros', type: 'compound' },
  // Piernas
  { name: 'Sentadilla libre', muscle: 'Piernas', type: 'compound' },
  { name: 'Sentadilla frontal', muscle: 'Piernas', type: 'compound' },
  { name: 'Sentadilla búlgara', muscle: 'Piernas', type: 'compound' },
  { name: 'Prensa de piernas', muscle: 'Piernas', type: 'compound' },
  { name: 'Hack squat', muscle: 'Piernas', type: 'compound' },
  { name: 'Zancadas caminando', muscle: 'Piernas', type: 'compound' },
  { name: 'Zancadas estáticas', muscle: 'Piernas', type: 'compound' },
  { name: 'Peso muerto piernas rígidas', muscle: 'Piernas', type: 'compound' },
  { name: 'Curl femoral acostado', muscle: 'Piernas', type: 'isolation' },
  { name: 'Curl femoral sentado', muscle: 'Piernas', type: 'isolation' },
  { name: 'Extensión de cuádriceps', muscle: 'Piernas', type: 'isolation' },
  { name: 'Adductor en máquina', muscle: 'Piernas', type: 'isolation' },
  { name: 'Abductor en máquina', muscle: 'Piernas', type: 'isolation' },
  { name: 'Gemelos de pie', muscle: 'Piernas', type: 'isolation' },
  { name: 'Gemelos en prensa', muscle: 'Piernas', type: 'isolation' },
  // Glúteos
  { name: 'Hip thrust', muscle: 'Glúteos', type: 'compound' },
  { name: 'Puente de glúteos', muscle: 'Glúteos', type: 'compound' },
  { name: 'Patada de glúteo en polea', muscle: 'Glúteos', type: 'isolation' },
  { name: 'Abducción en polea', muscle: 'Glúteos', type: 'isolation' },
  // Bíceps
  { name: 'Curl de bíceps con barra', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl con mancuernas', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl martillo', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl en polea baja', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl concentrado', muscle: 'Bíceps', type: 'isolation' },
  { name: 'Curl en banco Scott', muscle: 'Bíceps', type: 'isolation' },
  // Tríceps
  { name: 'Extensión de tríceps en polea', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Press francés', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Fondos en banco (tríceps)', muscle: 'Tríceps', type: 'compound' },
  { name: 'Patada de tríceps', muscle: 'Tríceps', type: 'isolation' },
  { name: 'Extensión overhead con mancuerna', muscle: 'Tríceps', type: 'isolation' },
  // Core
  { name: 'Crunch en polea', muscle: 'Core', type: 'isolation' },
  { name: 'Plancha', muscle: 'Core', type: 'isolation' },
  { name: 'Abdominales en máquina', muscle: 'Core', type: 'isolation' },
  { name: 'Elevación de piernas colgado', muscle: 'Core', type: 'isolation' },
  { name: 'Russian twist', muscle: 'Core', type: 'isolation' },
  { name: 'Pallof press', muscle: 'Core', type: 'isolation' },
  // Cardio / funcional
  { name: 'Cinta / caminadora', muscle: 'Cardio', type: 'cardio' },
  { name: 'Bicicleta estática', muscle: 'Cardio', type: 'cardio' },
  { name: 'Elíptica', muscle: 'Cardio', type: 'cardio' },
  { name: 'Remo ergómetro', muscle: 'Cardio', type: 'cardio' },
  { name: 'Battle ropes', muscle: 'Cardio', type: 'cardio' },
  { name: 'Burpees', muscle: 'Full body', type: 'cardio' },
  { name: 'Kettlebell swing', muscle: 'Full body', type: 'compound' },
  { name: 'Farmer walk', muscle: 'Full body', type: 'compound' },
  { name: 'Box jump', muscle: 'Full body', type: 'cardio' },
  { name: 'Sled push', muscle: 'Full body', type: 'compound' },
]

export const WORKOUT_TYPE_LABELS: Record<string, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Piernas',
  full: 'Full body',
  cardio: 'Cardio',
  other: 'Otro',
}

export const MUSCLE_GROUPS = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Piernas',
  'Glúteos',
  'Bíceps',
  'Tríceps',
  'Core',
  'Cardio',
  'Full body',
] as const

/** Muscle tab in Arena picker — Cardio includes functional full-body moves. */
export function exerciseMatchesMuscleTab(exercise: LibraryExercise, tab: string): boolean {
  if (tab === 'Todos') return true
  if (tab === 'Cardio') return exercise.muscle === 'Cardio' || exercise.muscle === 'Full body'
  return exercise.muscle === tab
}

export function filterLibraryByMuscleTab(tab: string): LibraryExercise[] {
  if (tab === 'Todos') return EXERCISE_LIBRARY
  return EXERCISE_LIBRARY.filter((e) => exerciseMatchesMuscleTab(e, tab))
}

export function filterExercises(query: string, limit = 12, muscle?: string): LibraryExercise[] {
  const q = query.trim().toLowerCase()
  let list = EXERCISE_LIBRARY
  if (muscle) {
    list = filterLibraryByMuscleTab(muscle)
  }
  if (!q) return list.slice(0, limit)
  return list
    .filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.muscle.toLowerCase().includes(q)
    )
    .slice(0, limit)
}
