import { describe, expect, it } from 'vitest'
import {
  bannerPrAriaMatchesPr,
  buildWorkoutSaveBannerPrToneAriaLabel,
  resolveWorkoutSaveBannerPrToneClass,
  WORKOUT_SAVE_BANNER_PR_TONE_CLASS,
} from './workoutSaveBannerPrToneDisplay'

describe('workoutSaveBannerPrToneDisplay', () => {
  it('resolveWorkoutSaveBannerPrToneClass', () => {
    expect(resolveWorkoutSaveBannerPrToneClass(true)).toBe(WORKOUT_SAVE_BANNER_PR_TONE_CLASS)
    expect(resolveWorkoutSaveBannerPrToneClass(false)).toBeNull()
  })

  it('buildWorkoutSaveBannerPrToneAriaLabel y bannerPrAriaMatchesPr', () => {
    const aria = buildWorkoutSaveBannerPrToneAriaLabel({
      title: 'Push',
      sessionSummary: '1 serie · 600 kg',
      prSummary: 'Press banca',
    })
    expect(aria).toMatch(/Entreno guardado: Push/)
    expect(aria).toMatch(/récord personal/)
    expect(bannerPrAriaMatchesPr(aria)).toBe(true)
    expect(bannerPrAriaMatchesPr('Entreno guardado: sin PR')).toBe(false)
  })
})