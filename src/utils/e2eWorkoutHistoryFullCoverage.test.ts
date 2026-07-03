import { describe, expect, it } from 'vitest'
import {
  countWorkoutHistoryCoverageSuites,
  e2eWorkoutHistoryFullBlockRange,
  isWorkoutHistoryFullE2ECoverageComplete,
  WORKOUT_HISTORY_FULL_COVERAGE_MODULES,
} from './e2eWorkoutHistoryFullCoverage'

describe('e2eWorkoutHistoryFullCoverage', () => {
  it('unifica 3 suites historial v2 oleadas 440–443', () => {
    expect(countWorkoutHistoryCoverageSuites()).toBe(3)
    expect(e2eWorkoutHistoryFullBlockRange()).toEqual({ from: 440, to: 443 })
    expect([...WORKOUT_HISTORY_FULL_COVERAGE_MODULES]).toEqual([
      'e2eWorkoutHistoryRowPrCoverage',
      'e2eWorkoutHistoryCoverage',
      'e2eWorkoutHistoryPostV2Coverage',
    ])
    expect(isWorkoutHistoryFullE2ECoverageComplete()).toBe(true)
  })
})