import { describe, expect, it } from 'vitest'
import {
  countTrainingPrV2CoverageSuites,
  e2eTrainingPrV2FullBlockRange,
  isTrainingPrV2FullE2ECoverageComplete,
  TRAINING_PR_V2_FULL_COVERAGE_MODULES,
} from './e2eTrainingPrV2FullCoverage'

describe('e2eTrainingPrV2FullCoverage', () => {
  it('unifica 4 suites PR v2 oleadas 436–444', () => {
    expect(countTrainingPrV2CoverageSuites()).toBe(4)
    expect(e2eTrainingPrV2FullBlockRange()).toEqual({ from: 436, to: 444 })
    expect([...TRAINING_PR_V2_FULL_COVERAGE_MODULES]).toEqual([
      'e2eGymLogFullCoverage',
      'e2ePostWorkoutFullCoverage',
      'e2eWorkoutHistoryFullCoverage',
      'e2eTrainingPrV2GlobalCoverage',
    ])
    expect(isTrainingPrV2FullE2ECoverageComplete()).toBe(true)
  })
})