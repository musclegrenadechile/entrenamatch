import type { WorkoutSet } from '../types'
import { normalizeWorkoutSet } from './workoutSetFields'

/** Copia los valores de una serie (reps/kg o min/intensidad) para duplicar la anterior. */
export function copyWorkoutSetValues(exerciseName: string, source: WorkoutSet): Partial<WorkoutSet> {
  const normalized = normalizeWorkoutSet(exerciseName, source)
  return {
    reps: normalized.reps,
    weightKg: normalized.weightKg,
    minutesMin: normalized.minutesMin,
    intensity: normalized.intensity,
  }
}

export function canDuplicateGymLogSet(setIdx: number): boolean {
  return setIdx > 0
}