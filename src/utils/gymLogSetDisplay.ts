import { isTimedCardioExercise } from '../data/exerciseLibrary'
import type { WorkoutSet } from '../types'

/** Resumen compacto bajo el nombre del ejercicio en gym-log. */
export function buildExerciseSetSummary(exerciseName: string, sets: WorkoutSet[]): string {
  const count = sets.length
  if (count === 0) return 'Sin series'

  if (isTimedCardioExercise(exerciseName)) {
    const mins = sets.reduce((n, s) => n + (s.minutesMin || 0), 0)
    const label = count === 1 ? '1 intervalo' : `${count} intervalos`
    return mins > 0 ? `${label} · ${mins} min` : label
  }

  const vol = sets.reduce((n, s) => n + (s.reps || 0) * (s.weightKg || 0), 0)
  const label = count === 1 ? '1 serie' : `${count} series`
  if (vol <= 0) return label
  const volStr = vol >= 1000 ? `${(vol / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(Math.round(vol))
  return `${label} · ${volStr} kg vol`
}

/** Serie con datos mínimos para considerarse registrada. */
export function isGymLogSetComplete(exerciseName: string, set: WorkoutSet): boolean {
  if (isTimedCardioExercise(exerciseName)) {
    return (set.minutesMin || 0) > 0
  }
  return (set.reps || 0) > 0
}