import { describe, expect, it } from 'vitest'
import {
  countPostWorkoutPostV2CoverageModules,
  e2ePostWorkoutPostV2BlockRange,
  isPostWorkoutPostV2E2ECoverageComplete,
  POST_WORKOUT_POST_V2_COVERAGE_MODULES,
} from './e2ePostWorkoutPostV2Coverage'

describe('e2ePostWorkoutPostV2Coverage', () => {
  it('cierre post-entreno v2 oleadas 439–442', () => {
    expect(countPostWorkoutPostV2CoverageModules()).toBe(4)
    expect(e2ePostWorkoutPostV2BlockRange()).toEqual({ from: 439, to: 442 })
    expect([...POST_WORKOUT_POST_V2_COVERAGE_MODULES]).toEqual([
      'workoutSaveBannerPrToneDisplay',
      'fuelLogPrefillPrToneDisplay',
      'e2eWorkoutSaveBannerPrCoverage',
      'e2eFuelLogPrefillPrCoverage',
    ])
    expect(isPostWorkoutPostV2E2ECoverageComplete()).toBe(true)
  })
})