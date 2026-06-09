/**
 * Entreno de Hoy — PR detection (oleada 1).
 */

import type { Workout, WorkoutExercise } from '../types'

export interface WorkoutPR {
  exercise: string
  weightKg: number
  reps: number
  previousBest?: { weightKg: number; reps: number }
}

function bestSetForExercise(exercises: WorkoutExercise[]): Map<string, { weightKg: number; reps: number }> {
  const best = new Map<string, { weightKg: number; reps: number }>()
  for (const ex of exercises) {
    const key = ex.name.trim().toLowerCase()
    for (const set of ex.sets || []) {
      const w = set.weightKg || 0
      const r = set.reps || 0
      if (w <= 0 && r <= 0) continue
      const prev = best.get(key)
      if (
        !prev ||
        w > prev.weightKg ||
        (w === prev.weightKg && r > prev.reps)
      ) {
        best.set(key, { weightKg: w, reps: r })
      }
    }
  }
  return best
}

function historyBestByExercise(history: Workout[]): Map<string, { weightKg: number; reps: number }> {
  const best = new Map<string, { weightKg: number; reps: number }>()
  for (const w of history) {
    for (const [key, set] of bestSetForExercise(w.exercises || [])) {
      const prev = best.get(key)
      if (
        !prev ||
        set.weightKg > prev.weightKg ||
        (set.weightKg === prev.weightKg && set.reps > prev.reps)
      ) {
        best.set(key, set)
      }
    }
  }
  return best
}

/** Compare new session vs past workouts; returns PRs per exercise (best set in session). */
export function detectWorkoutPRs(
  exercises: WorkoutExercise[],
  history: Workout[]
): WorkoutPR[] {
  const historical = historyBestByExercise(history)
  const sessionBest = bestSetForExercise(exercises)
  const prs: WorkoutPR[] = []

  for (const ex of exercises) {
    const key = ex.name.trim().toLowerCase()
    const session = sessionBest.get(key)
    if (!session) continue
    const prev = historical.get(key)
    const beats =
      !prev ||
      session.weightKg > prev.weightKg ||
      (session.weightKg === prev.weightKg && session.reps > prev.reps)
    if (beats && (session.weightKg > 0 || session.reps > 0)) {
      prs.push({
        exercise: ex.name,
        weightKg: session.weightKg,
        reps: session.reps,
        previousBest: prev,
      })
    }
  }

  return prs
}

export function formatWorkoutPRSummary(prs: WorkoutPR[]): string {
  if (!prs.length) return ''
  if (prs.length === 1) {
    const p = prs[0]
    const w = p.weightKg > 0 ? `${p.weightKg}kg` : ''
    return `🏆 PR ${p.exercise}${w ? ` · ${p.reps}×${w}` : ` · ${p.reps} reps`}`
  }
  return `🏆 ${prs.length} PRs: ${prs.map((p) => p.exercise).join(', ')}`
}
