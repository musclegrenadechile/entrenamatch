import type { WorkoutExercise, WorkoutType } from '../../types'
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary'
import { WORKOUT_TYPE_LABELS } from '../../data/exerciseLibrary'

const TYPE_MUSCLE_HINT: Partial<Record<WorkoutType, string>> = {
  push: 'Pecho',
  pull: 'Espalda',
  legs: 'Piernas',
  full: 'Full body',
  cardio: 'Cardio',
}

function resolveExerciseMuscle(name: string): string | null {
  const n = name.trim().toLowerCase()
  if (!n) return null
  const exact = EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === n)
  if (exact) return exact.muscle
  const partial = EXERCISE_LIBRARY.find(
    (e) => n.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(n)
  )
  return partial?.muscle ?? null
}

/** Infer dominant muscle group from logged exercises (L2). */
export function inferDominantMuscle(
  exercises: WorkoutExercise[],
  fallbackType?: WorkoutType
): string | undefined {
  const scores = new Map<string, number>()

  for (const ex of exercises) {
    const muscle = resolveExerciseMuscle(ex.name)
    const key = muscle || 'Otro'
    const compoundBoost = ex.sets.length >= 3 ? 1.2 : 1
    const vol = ex.sets.reduce((s, set) => s + (set.reps || 0) * (set.weightKg || 0), 0)
    const weight = ex.sets.length * compoundBoost + vol / 5000
    scores.set(key, (scores.get(key) || 0) + weight)
  }

  if (scores.size === 0) {
    if (fallbackType && TYPE_MUSCLE_HINT[fallbackType]) {
      return TYPE_MUSCLE_HINT[fallbackType]
    }
    return undefined
  }

  let best = ''
  let bestScore = -1
  for (const [muscle, score] of scores) {
    if (score > bestScore) {
      bestScore = score
      best = muscle
    }
  }
  return best || undefined
}

export function workoutInsightLabel(
  type: WorkoutType,
  dominantMuscle?: string
): string {
  if (dominantMuscle && dominantMuscle !== 'Otro') return dominantMuscle
  return WORKOUT_TYPE_LABELS[type] || type
}
