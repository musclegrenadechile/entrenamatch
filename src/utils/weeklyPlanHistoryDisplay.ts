import type { Workout } from '../types'
import { detectWorkoutPRs } from './workoutPR'

export const WEEKLY_PLAN_HISTORY_HINT_CLASS = 'em-v2-plan__history-hint'

const MAX_HINT_AGE_MS = 7 * 86_400_000

/** Hint de PR reciente para EntrenaPlan × historial (oleada 401). */
export function buildWeeklyPlanHistoryHint(
  workouts: Workout[],
  now = Date.now()
): string | null {
  if (!workouts.length) return null
  const latest = workouts[0]
  const endedAt = latest.endedAt || latest.startedAt
  if (now - endedAt > MAX_HINT_AGE_MS) return null

  const prs = detectWorkoutPRs(latest.exercises || [], workouts.slice(1))
  if (!prs.length) return null

  if (prs.length === 1) {
    const pr = prs[0]
    const load =
      pr.weightKg > 0 ? `${pr.reps}×${pr.weightKg} kg` : `${pr.reps} reps`
    return `🏆 PR en ${pr.exercise} (${load}) — sigue progresando`
  }

  return `🏆 ${prs.length} PRs en tu último entreno — mantén el ritmo`
}

export function buildWeeklyPlanHistoryAriaLabel(hint: string): string {
  return `Progreso reciente: ${hint.replace(/^🏆\s*/, '')}`
}

export function shouldShowWeeklyPlanHistoryHint(
  activityType: 'strength' | 'cardio' | 'walk' | 'rest' | 'mobility',
  hint: string | null
): boolean {
  if (!hint) return false
  return activityType === 'strength' || activityType === 'cardio'
}