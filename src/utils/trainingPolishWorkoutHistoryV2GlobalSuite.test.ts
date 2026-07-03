import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishWorkoutHistoryV2GlobalUtils,
  isTrainingPolishWorkoutHistoryV2GlobalClosed,
  TRAINING_POLISH_WORKOUT_HISTORY_V2_GLOBAL_UTILS,
  trainingPolishWorkoutHistoryV2GlobalRange,
} from './trainingPolishWorkoutHistoryV2GlobalSuite'

describe('trainingPolishWorkoutHistoryV2GlobalSuite', () => {
  it('cierre global historial v2 oleada 452', () => {
    expect(countTrainingPolishWorkoutHistoryV2GlobalUtils()).toBe(2)
    expect(trainingPolishWorkoutHistoryV2GlobalRange()).toEqual({ from: 452, to: 452 })
    expect(TRAINING_POLISH_WORKOUT_HISTORY_V2_GLOBAL_UTILS.map((e) => e.module)).toEqual([
      'trainingWorkoutHistoryV2GlobalClosure',
      'e2eWorkoutHistoryV2GlobalCoverage',
    ])
    expect(isTrainingPolishWorkoutHistoryV2GlobalClosed()).toBe(true)
    expect(isTrainingPolishWorkoutHistoryV2GlobalClosed(451)).toBe(false)
  })
})