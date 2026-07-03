import { isTimedCardioExercise } from '../data/exerciseLibrary'
import type { Workout, WorkoutExercise, WorkoutSet } from '../types'
import { isGymLogSetComplete } from './gymLogSetDisplay'
import { detectWorkoutPRs } from './workoutPR'

function bestSetIndex(exerciseName: string, sets: WorkoutSet[]): number | null {
  let bestIdx: number | null = null
  let bestW = -1
  let bestR = -1

  for (let i = 0; i < sets.length; i++) {
    const set = sets[i]
    if (!isGymLogSetComplete(exerciseName, set)) continue
    const w = set.weightKg || 0
    const r = set.reps || 0
    if (w > bestW || (w === bestW && r > bestR)) {
      bestW = w
      bestR = r
      bestIdx = i
    }
  }

  return bestIdx
}

/** Índice de la serie que sería PR en vivo (null si ninguna). */
export function getGymLogLivePRSetIndex(
  exerciseName: string,
  sets: WorkoutSet[],
  history: Workout[]
): number | null {
  if (isTimedCardioExercise(exerciseName) || sets.length === 0) return null

  const prs = detectWorkoutPRs([{ name: exerciseName, sets }], history)
  if (!prs.length) return null

  const idx = bestSetIndex(exerciseName, sets)
  if (idx === null) return null

  const best = sets[idx]
  const pr = prs.find((p) => p.exercise === exerciseName)
  if (!pr) return null

  return best.reps === pr.reps && best.weightKg === pr.weightKg ? idx : null
}

/** PRs detectados en la sesión actual vs historial. */
export function countGymLogLivePRs(exercises: WorkoutExercise[], history: Workout[]): number {
  return detectWorkoutPRs(exercises, history).length
}

function livePRKey(exerciseName: string, set: WorkoutSet): string {
  return `${exerciseName.trim().toLowerCase()}:${set.reps || 0}:${set.weightKg || 0}`
}

/** Claves de series PR en vivo — para detectar transiciones sin duplicar feedback. */
export function buildGymLogLivePRKeys(exercises: WorkoutExercise[], history: Workout[]): Set<string> {
  const keys = new Set<string>()
  for (const ex of exercises) {
    const idx = getGymLogLivePRSetIndex(ex.name, ex.sets, history)
    if (idx === null) continue
    keys.add(livePRKey(ex.name, ex.sets[idx]))
  }
  return keys
}

/** True si hay al menos una clave PR nueva respecto al snapshot anterior. */
export function hasNewGymLogLivePRKeys(prev: Set<string>, next: Set<string>): boolean {
  for (const key of next) {
    if (!prev.has(key)) return true
  }
  return false
}