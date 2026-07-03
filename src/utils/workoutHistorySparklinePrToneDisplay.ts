import {
  countWorkoutHistorySparklinePrPoints,
  type WorkoutHistorySparklinePoint,
} from './workoutHistorySparkline'

export const WORKOUT_HISTORY_SPARKLINE_CLASS = 'em-v2-training-history__sparkline'

export const WORKOUT_HISTORY_SPARKLINE_PR_TONE_CLASS = `${WORKOUT_HISTORY_SPARKLINE_CLASS}--has-pr`

export function resolveWorkoutHistorySparklinePrToneClass(hasPr: boolean): string | null {
  return hasPr ? WORKOUT_HISTORY_SPARKLINE_PR_TONE_CLASS : null
}

/** aria-label del sparkline historial con PR v2 (oleada 448). */
export function buildWorkoutHistorySparklinePrToneAriaLabel(
  points: readonly WorkoutHistorySparklinePoint[]
): string {
  if (points.length < 2) return ''
  const prCount = countWorkoutHistorySparklinePrPoints(points)
  const latest = Math.round(points[points.length - 1]?.volumeKg ?? 0)
  if (prCount > 0) {
    const sessions = prCount === 1 ? 'sesión' : 'sesiones'
    return `Tendencia de volumen con récord personal; ${prCount} ${sessions} marcadas; último ${latest} kg`
  }
  return `Tendencia de volumen; último ${latest} kg`
}

export function sparklinePrAriaMatchesPr(ariaLabel: string | null): boolean {
  if (!ariaLabel) return false
  return ariaLabel.includes('récord personal')
}