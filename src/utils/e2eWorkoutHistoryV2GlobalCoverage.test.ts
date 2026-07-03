import { describe, expect, it } from 'vitest'
import {
  countWorkoutHistoryV2GlobalCoverageModules,
  e2eWorkoutHistoryV2GlobalBlockRange,
  isE2EWorkoutHistoryV2GlobalCoverageComplete,
  WORKOUT_HISTORY_V2_GLOBAL_COVERAGE_MODULES,
} from './e2eWorkoutHistoryV2GlobalCoverage'

describe('e2eWorkoutHistoryV2GlobalCoverage', () => {
  it('inventario cierre global historial v2 oleada 452', () => {
    expect(countWorkoutHistoryV2GlobalCoverageModules()).toBe(5)
    expect(e2eWorkoutHistoryV2GlobalBlockRange()).toEqual({ from: 440, to: 452 })
    expect([...WORKOUT_HISTORY_V2_GLOBAL_COVERAGE_MODULES]).toEqual([
      'trainingPolishWorkoutHistoryV2Suite',
      'e2eWorkoutHistoryFullCoverage',
      'e2eWorkoutHistorySparklineFullCoverage',
      'e2eTrainingPolishBridge',
      'trainingWorkoutHistoryV2GlobalClosure',
    ])
    expect(isE2EWorkoutHistoryV2GlobalCoverageComplete()).toBe(true)
  })
})