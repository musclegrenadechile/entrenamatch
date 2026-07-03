import { describe, expect, it } from 'vitest'
import {
  countWorkoutHistoryPostV2CoverageModules,
  e2eWorkoutHistoryPostV2BlockRange,
  isWorkoutHistoryPostV2E2ECoverageComplete,
  WORKOUT_HISTORY_POST_V2_COVERAGE_MODULES,
} from './e2eWorkoutHistoryPostV2Coverage'

describe('e2eWorkoutHistoryPostV2Coverage', () => {
  it('cierre historial v2 oleadas 440–443', () => {
    expect(countWorkoutHistoryPostV2CoverageModules()).toBe(2)
    expect(e2eWorkoutHistoryPostV2BlockRange()).toEqual({ from: 440, to: 443 })
    expect([...WORKOUT_HISTORY_POST_V2_COVERAGE_MODULES]).toEqual([
      'workoutHistoryRowPrToneDisplay',
      'e2eWorkoutHistoryRowPrCoverage',
    ])
    expect(isWorkoutHistoryPostV2E2ECoverageComplete()).toBe(true)
  })
})