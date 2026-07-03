import { describe, expect, it } from 'vitest'
import {
  buildWorkoutHistorySummaryPrToneAriaLabel,
  historyRowPrAriaMatchesPr,
  resolveWorkoutHistoryRowPrToneClass,
  resolveWorkoutHistorySummaryPrToneClass,
  WORKOUT_HISTORY_ROW_PR_TONE_CLASS,
  WORKOUT_HISTORY_SUMMARY_PR_TONE_CLASS,
} from './workoutHistoryRowPrToneDisplay'

describe('workoutHistoryRowPrToneDisplay', () => {
  it('resolveWorkoutHistoryRowPrToneClass y summary', () => {
    expect(resolveWorkoutHistoryRowPrToneClass(true)).toBe(WORKOUT_HISTORY_ROW_PR_TONE_CLASS)
    expect(resolveWorkoutHistoryRowPrToneClass(false)).toBeNull()
    expect(resolveWorkoutHistorySummaryPrToneClass(true)).toBe(
      WORKOUT_HISTORY_SUMMARY_PR_TONE_CLASS
    )
    expect(resolveWorkoutHistorySummaryPrToneClass(false)).toBeNull()
  })

  it('buildWorkoutHistorySummaryPrToneAriaLabel y historyRowPrAriaMatchesPr', () => {
    const aria = buildWorkoutHistorySummaryPrToneAriaLabel('1 ejercicio · 600 kg', true)
    expect(aria).toMatch(/Resumen con PR/)
    expect(historyRowPrAriaMatchesPr(aria)).toBe(true)
    expect(historyRowPrAriaMatchesPr('Resumen: sin PR')).toBe(false)
  })
})