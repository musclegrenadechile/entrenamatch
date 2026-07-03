import { describe, expect, it } from 'vitest'
import {
  buildWorkoutHistorySparklinePrToneAriaLabel,
  resolveWorkoutHistorySparklinePrToneClass,
  sparklinePrAriaMatchesPr,
  WORKOUT_HISTORY_SPARKLINE_PR_TONE_CLASS,
} from './workoutHistorySparklinePrToneDisplay'

describe('workoutHistorySparklinePrToneDisplay', () => {
  it('resolveWorkoutHistorySparklinePrToneClass', () => {
    expect(resolveWorkoutHistorySparklinePrToneClass(true)).toBe(
      WORKOUT_HISTORY_SPARKLINE_PR_TONE_CLASS
    )
    expect(resolveWorkoutHistorySparklinePrToneClass(false)).toBeNull()
  })

  it('buildWorkoutHistorySparklinePrToneAriaLabel y sparklinePrAriaMatchesPr', () => {
    const points = [
      { volumeKg: 480, isPr: false },
      { volumeKg: 800, isPr: true },
    ]
    const aria = buildWorkoutHistorySparklinePrToneAriaLabel(points)
    expect(aria).toMatch(/récord personal/)
    expect(aria).toMatch(/800 kg/)
    expect(sparklinePrAriaMatchesPr(aria)).toBe(true)
    expect(sparklinePrAriaMatchesPr('Tendencia de volumen; último 400 kg')).toBe(false)
  })
})