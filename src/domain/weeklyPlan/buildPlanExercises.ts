import type { WorkoutExercise, WorkoutType } from '../../types'
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary'

const PRESETS: Record<WorkoutType, string[]> = {
  push: ['Press banca', 'Press inclinado con mancuernas', 'Fondos en paralelas', 'Aperturas con mancuernas'],
  pull: ['Dominadas', 'Remo con barra', 'Jalón al pecho', 'Remo con mancuerna'],
  legs: ['Sentadilla libre', 'Prensa de piernas', 'Peso muerto rumano', 'Zancadas caminando'],
  full: ['Sentadilla libre', 'Press banca', 'Remo con barra', 'Press militar'],
  cardio: ['Bicicleta estática', 'Elíptica', 'Cinta / caminadora', 'Saltos al cajón'],
  other: ['Press banca', 'Sentadilla libre', 'Remo con barra'],
}

const LEVEL_SETS: Record<string, number> = {
  Principiante: 3,
  Intermedio: 4,
  Avanzado: 5,
}

function emptyExercise(name: string, sets: number): WorkoutExercise {
  return {
    name,
    sets: Array.from({ length: sets }, () => ({ reps: 10, weightKg: 0 })),
  }
}

function resolveName(preset: string): string {
  const found = EXERCISE_LIBRARY.find(
    (e) => e.name.toLowerCase() === preset.toLowerCase()
  )
  return found?.name ?? preset
}

export function buildPlanExercises(
  workoutType: WorkoutType,
  level: 'Principiante' | 'Intermedio' | 'Avanzado',
  maxExercises = 4
): WorkoutExercise[] {
  const sets = LEVEL_SETS[level] ?? 3
  const names = (PRESETS[workoutType] || PRESETS.full).slice(0, maxExercises)
  return names.map((n) => emptyExercise(resolveName(n), sets))
}

export function planTitleForType(type: WorkoutType, intensity: string): string {
  const labels: Record<WorkoutType, string> = {
    push: 'Torso empuje',
    pull: 'Torso tirón',
    legs: 'Piernas',
    full: 'Full body',
    cardio: 'Cardio',
    other: 'Entreno',
  }
  const base = labels[type] || 'Entreno'
  if (intensity === 'light') return `${base} ligero`
  if (intensity === 'intense') return `${base} intenso`
  return base
}
