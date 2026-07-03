import { describe, expect, it } from 'vitest'
import {
  countWorkoutHistorySparklineCoverageSuites,
  e2eWorkoutHistorySparklineFullBlockRange,
  isWorkoutHistorySparklineFullE2ECoverageComplete,
  WORKOUT_HISTORY_SPARKLINE_FULL_COVERAGE_MODULES,
} from './e2eWorkoutHistorySparklineFullCoverage'

describe('e2eWorkoutHistorySparklineFullCoverage', () => {
  it('unifica 3 suites sparkline historial v2 oleadas 448–449', () => {
    expect(countWorkoutHistorySparklineCoverageSuites()).toBe(3)
    expect(e2eWorkoutHistorySparklineFullBlockRange()).toEqual({ from: 448, to: 449 })
    expect([...WORKOUT_HISTORY_SPARKLINE_FULL_COVERAGE_MODULES]).toEqual([
      'e2eWorkoutHistorySparklinePrCoverage',
      'e2eWorkoutHistorySparklineCoverage',
      'e2eWorkoutHistorySparklinePostV2Coverage',
    ])
    expect(isWorkoutHistorySparklineFullE2ECoverageComplete()).toBe(true)
  })
})