import { describe, expect, it } from 'vitest'
import {
  hasWorkoutSaveBannerSessionSummary,
  WORKOUT_SAVE_BANNER_SESSION_CLASS,
} from './workoutSaveBannerDisplay'

describe('workoutSaveBannerDisplay', () => {
  it('WORKOUT_SAVE_BANNER_SESSION_CLASS', () => {
    expect(WORKOUT_SAVE_BANNER_SESSION_CLASS).toBe('em-v2-training-save-banner__session')
  })

  it('hasWorkoutSaveBannerSessionSummary', () => {
    expect(hasWorkoutSaveBannerSessionSummary(undefined)).toBe(false)
    expect(hasWorkoutSaveBannerSessionSummary('')).toBe(false)
    expect(hasWorkoutSaveBannerSessionSummary('1 serie · 600 kg')).toBe(true)
  })
})