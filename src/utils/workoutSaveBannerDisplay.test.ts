import { describe, expect, it } from 'vitest'
import {
  buildWorkoutSaveBannerFuelHint,
  hasWorkoutSaveBannerSessionSummary,
  WORKOUT_SAVE_BANNER_FUEL_CLASS,
  WORKOUT_SAVE_BANNER_SESSION_CLASS,
} from './workoutSaveBannerDisplay'

describe('workoutSaveBannerDisplay', () => {
  it('WORKOUT_SAVE_BANNER_SESSION_CLASS', () => {
    expect(WORKOUT_SAVE_BANNER_SESSION_CLASS).toBe('em-v2-training-save-banner__session')
  })

  it('WORKOUT_SAVE_BANNER_FUEL_CLASS', () => {
    expect(WORKOUT_SAVE_BANNER_FUEL_CLASS).toBe('em-v2-training-save-banner__fuel')
  })

  it('hasWorkoutSaveBannerSessionSummary', () => {
    expect(hasWorkoutSaveBannerSessionSummary(undefined)).toBe(false)
    expect(hasWorkoutSaveBannerSessionSummary('')).toBe(false)
    expect(hasWorkoutSaveBannerSessionSummary('1 serie · 600 kg')).toBe(true)
  })

  it('buildWorkoutSaveBannerFuelHint con burn y proteína restante', () => {
    const hint = buildWorkoutSaveBannerFuelHint({ burnKcal: 420, proteinRemainingG: 28 })
    expect(hint).toContain('Fuel sugerido')
    expect(hint).toContain('proteína')
    expect(hint).toContain('28g P')
  })

  it('buildWorkoutSaveBannerFuelHint solo proteína restante', () => {
    expect(buildWorkoutSaveBannerFuelHint({ proteinRemainingG: 22 })).toBe('Faltan ~22g P hoy')
    expect(buildWorkoutSaveBannerFuelHint({})).toBeUndefined()
  })
})