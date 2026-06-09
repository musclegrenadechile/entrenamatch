import { getLibraryExercise, isTimedCardioExercise } from '../data/exerciseLibrary'
import type { WorkoutExercise, WorkoutSet } from '../types'

export function emptyStrengthSet(): WorkoutSet {
  return { reps: 10, weightKg: 0 }
}

export function emptyCardioSet(): WorkoutSet {
  return { reps: 0, weightKg: 0, minutesMin: 15, intensity: 6 }
}

export function emptySetForExercise(exerciseName: string): WorkoutSet {
  return isTimedCardioExercise(exerciseName) ? emptyCardioSet() : emptyStrengthSet()
}

export function emptyExerciseEntry(name: string): WorkoutExercise {
  return { name, sets: [emptySetForExercise(name)] }
}

/** Normalize legacy cardio rows that stored minutes in `reps`. */
export function normalizeWorkoutSet(exerciseName: string, set: WorkoutSet): WorkoutSet {
  if (!isTimedCardioExercise(exerciseName)) return set
  if (set.minutesMin != null && set.minutesMin > 0) {
    return { ...set, reps: 0, weightKg: 0 }
  }
  if (set.reps > 0) {
    return {
      ...set,
      minutesMin: set.reps,
      intensity: set.intensity ?? (set.weightKg > 0 ? clampIntensity(set.weightKg) : 6),
      reps: 0,
      weightKg: 0,
    }
  }
  return { ...emptyCardioSet(), ...set, reps: 0, weightKg: 0 }
}

export function normalizeWorkoutExercise(exercise: WorkoutExercise): WorkoutExercise {
  return {
    ...exercise,
    sets: exercise.sets.map((s) => normalizeWorkoutSet(exercise.name, s)),
  }
}

export function clampIntensity(value: number): number {
  return Math.min(10, Math.max(1, Math.round(value)))
}

export function formatSetDisplay(exerciseName: string, set: WorkoutSet): string {
  const normalized = normalizeWorkoutSet(exerciseName, set)
  if (isTimedCardioExercise(exerciseName)) {
    const min = normalized.minutesMin ?? 0
    const intensity = normalized.intensity ?? 0
    return intensity > 0 ? `${min} min · ${intensity}/10` : `${min} min`
  }
  return normalized.weightKg > 0
    ? `${normalized.reps}×${normalized.weightKg}kg`
    : `${normalized.reps}`
}

export function exerciseMuscleLabel(name: string): string | undefined {
  return getLibraryExercise(name)?.muscle
}
