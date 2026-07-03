import { describe, expect, it } from 'vitest'
import {
  countTrainingPrV2GlobalCoverageModules,
  e2eTrainingPrV2GlobalBlockRange,
  isE2ETrainingPrV2GlobalCoverageComplete,
  TRAINING_PR_V2_GLOBAL_COVERAGE_MODULES,
} from './e2eTrainingPrV2GlobalCoverage'

describe('e2eTrainingPrV2GlobalCoverage', () => {
  it('cierre global PR v2 436–444', () => {
    expect(countTrainingPrV2GlobalCoverageModules()).toBe(6)
    expect(e2eTrainingPrV2GlobalBlockRange()).toEqual({ from: 436, to: 444 })
    expect([...TRAINING_PR_V2_GLOBAL_COVERAGE_MODULES]).toEqual([
      'trainingPrV2Suite',
      'e2eGymLogFullCoverage',
      'e2ePostWorkoutFullCoverage',
      'e2eWorkoutHistoryFullCoverage',
      'e2eTrainingPolishBridge',
      'trainingPrV2GlobalClosure',
    ])
    expect(isE2ETrainingPrV2GlobalCoverageComplete()).toBe(true)
  })
})