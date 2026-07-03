import { WORKOUT_HISTORY_SUMMARY_CLASS } from './workoutHistoryDisplay'

export const WORKOUT_HISTORY_ROW_CLASS = 'em-v2-training-history__row'

export const WORKOUT_HISTORY_ROW_PR_TONE_CLASS = `${WORKOUT_HISTORY_ROW_CLASS}--has-pr`

export const WORKOUT_HISTORY_SUMMARY_PR_TONE_CLASS = `${WORKOUT_HISTORY_SUMMARY_CLASS}--has-pr`

export function resolveWorkoutHistoryRowPrToneClass(hasPr: boolean): string | null {
  return hasPr ? WORKOUT_HISTORY_ROW_PR_TONE_CLASS : null
}

export function resolveWorkoutHistorySummaryPrToneClass(hasPr: boolean): string | null {
  return hasPr ? WORKOUT_HISTORY_SUMMARY_PR_TONE_CLASS : null
}

/** aria-label del resumen compacto en fila con PR (oleada 440). */
export function buildWorkoutHistorySummaryPrToneAriaLabel(
  summary: string,
  hasPr: boolean
): string {
  if (hasPr) {
    return `Resumen con PR: ${summary}`
  }
  return `Resumen: ${summary}`
}

export function historyRowPrAriaMatchesPr(ariaLabel: string | null): boolean {
  if (!ariaLabel) return false
  return ariaLabel.includes('con PR') || ariaLabel.includes('Resumen con PR')
}