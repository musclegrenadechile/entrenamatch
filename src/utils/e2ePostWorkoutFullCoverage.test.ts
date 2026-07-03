import { describe, expect, it } from 'vitest'
import {
  countPostWorkoutCoverageSuites,
  e2ePostWorkoutFullBlockRange,
  isPostWorkoutFullE2ECoverageComplete,
  POST_WORKOUT_FULL_COVERAGE_MODULES,
} from './e2ePostWorkoutFullCoverage'

describe('e2ePostWorkoutFullCoverage', () => {
  it('unifica 3 suites post-entreno v2 oleadas 439–442', () => {
    expect(countPostWorkoutCoverageSuites()).toBe(3)
    expect(e2ePostWorkoutFullBlockRange()).toEqual({ from: 439, to: 442 })
    expect([...POST_WORKOUT_FULL_COVERAGE_MODULES]).toEqual([
      'e2eWorkoutSaveBannerPrCoverage',
      'e2eFuelLogPrefillPrCoverage',
      'e2ePostWorkoutPostV2Coverage',
    ])
    expect(isPostWorkoutFullE2ECoverageComplete()).toBe(true)
  })
})