import { describe, expect, it } from 'vitest'
import {
  countWorkoutHistoryV2GlobalCoverageSuites,
  e2eWorkoutHistoryV2GlobalFullBlockRange,
  isWorkoutHistoryV2GlobalFullE2ECoverageComplete,
  WORKOUT_HISTORY_V2_GLOBAL_FULL_COVERAGE_MODULES,
} from './e2eWorkoutHistoryV2GlobalFullCoverage'

describe('e2eWorkoutHistoryV2GlobalFullCoverage', () => {
  it('unifica 3 suites historial v2 global oleadas 440–453', () => {
    expect(countWorkoutHistoryV2GlobalCoverageSuites()).toBe(3)
    expect(e2eWorkoutHistoryV2GlobalFullBlockRange()).toEqual({ from: 440, to: 453 })
    expect([...WORKOUT_HISTORY_V2_GLOBAL_FULL_COVERAGE_MODULES]).toEqual([
      'e2eWorkoutHistoryFullCoverage',
      'e2eWorkoutHistorySparklineFullCoverage',
      'e2eWorkoutHistoryV2GlobalCoverage',
    ])
    expect(isWorkoutHistoryV2GlobalFullE2ECoverageComplete()).toBe(true)
  })
})