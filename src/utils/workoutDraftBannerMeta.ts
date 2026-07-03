import type { WorkoutDraft } from './workoutDraft'
import { formatDraftAge, formatWorkoutSessionTimer } from './workoutDraft'

/** Subtítulo del banner «Entreno sin terminar» en Hoy. */
export function buildWorkoutDraftBannerMeta(draft: WorkoutDraft, now = Date.now()): string {
  const exerciseCount = draft.exercises.length
  const setCount = draft.exercises.reduce((n, e) => n + e.sets.length, 0)
  const parts = [
    `${exerciseCount} ejercicio${exerciseCount !== 1 ? 's' : ''}`,
    `${setCount} bloque${setCount !== 1 ? 's' : ''}`,
    formatDraftAge(draft.updatedAt),
  ]
  const timer = formatWorkoutSessionTimer(draft.startedAt, now)
  if (timer) parts.push(timer)
  return parts.join(' · ')
}