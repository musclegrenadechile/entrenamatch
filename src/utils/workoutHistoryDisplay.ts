import type { Workout } from '../types'
import { buildGymLogSessionChipCompact } from './gymLogSessionDisplay'
import {
  buildWorkoutHistoryBadges,
  type WorkoutHistoryBadge,
} from './workoutHistoryBadges'

export const WORKOUT_HISTORY_SUMMARY_CLASS = 'em-v2-training-history__summary'

/** Resumen compacto series/volumen en fila de historial (oleada 395). */
export function buildWorkoutHistoryRowSummary(workout: Workout): string {
  if (!workout.exercises?.length) return ''
  return buildGymLogSessionChipCompact(workout.exercises)
}

export function formatWorkoutHistoryBadgeDisplay(badge: WorkoutHistoryBadge): string {
  if (badge.kind === 'pr') return `🏆 ${badge.label}`
  return badge.label
}

export function getWorkoutHistoryBadgeAriaLabel(badge: WorkoutHistoryBadge): string {
  if (badge.kind === 'pr') return `Récord personal: ${badge.label}`
  if (badge.kind === 'sync') return 'Entrenamiento EntrenaSync'
  return badge.label
}

/** Cuenta filas del historial visibles con badge PR. */
export function countWorkoutHistoryRowsWithPr(workouts: Workout[]): number {
  return workouts.reduce((acc, w, index) => {
    const hasPr = buildWorkoutHistoryBadges(w, workouts.slice(index + 1)).some(
      (b) => b.kind === 'pr'
    )
    return acc + (hasPr ? 1 : 0)
  }, 0)
}

export function buildWorkoutHistorySectionKicker(
  workouts: Workout[],
  maxVisible = 5
): string {
  const visible = Math.min(workouts.length, maxVisible)
  const prRows = countWorkoutHistoryRowsWithPr(workouts.slice(0, maxVisible))
  if (visible === 0) return 'Tu bitácora de entrenamientos'
  if (prRows > 0) {
    return `Últimos ${visible} · ${prRows} con PR`
  }
  return `Últimos ${visible} entrenos`
}