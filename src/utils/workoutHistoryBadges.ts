import type { Workout } from '../types'
import { detectWorkoutPRs } from './workoutPR'

export type WorkoutHistoryBadgeKind = 'sync' | 'pr'

export type WorkoutHistoryBadge = {
  kind: WorkoutHistoryBadgeKind
  label: string
}

/** Badges para filas de historial en Perfil / Entreno de Hoy. */
export function buildWorkoutHistoryBadges(
  workout: Workout,
  priorHistory: Workout[]
): WorkoutHistoryBadge[] {
  const badges: WorkoutHistoryBadge[] = []

  if (workout.source === 'sync') {
    badges.push({ kind: 'sync', label: 'Sync' })
  }

  const prCount = detectWorkoutPRs(workout.exercises || [], priorHistory).length
  if (prCount > 0) {
    badges.push({
      kind: 'pr',
      label: prCount === 1 ? '1 PR' : `${prCount} PRs`,
    })
  }

  return badges
}