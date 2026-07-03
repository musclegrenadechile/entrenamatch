import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishWorkoutHistoryV2Utils,
  isTrainingPolishWorkoutHistoryV2Open,
  TRAINING_POLISH_WORKOUT_HISTORY_V2_UTILS,
  trainingPolishWorkoutHistoryV2Range,
} from './trainingPolishWorkoutHistoryV2Suite'

describe('trainingPolishWorkoutHistoryV2Suite', () => {
  it('pivot historial v2 oleada 440', () => {
    expect(countTrainingPolishWorkoutHistoryV2Utils()).toBe(1)
    expect(trainingPolishWorkoutHistoryV2Range()).toEqual({ from: 440, to: 440 })
    expect(TRAINING_POLISH_WORKOUT_HISTORY_V2_UTILS.map((e) => e.id)).toEqual([
      'history-row-pr-tone',
    ])
    expect(isTrainingPolishWorkoutHistoryV2Open()).toBe(true)
    expect(isTrainingPolishWorkoutHistoryV2Open(439)).toBe(false)
  })
})