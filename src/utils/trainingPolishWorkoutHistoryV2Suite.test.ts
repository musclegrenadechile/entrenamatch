import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishWorkoutHistoryV2Utils,
  isTrainingPolishWorkoutHistoryV2Closed,
  isTrainingPolishWorkoutHistoryV2Open,
  TRAINING_POLISH_WORKOUT_HISTORY_V2_UTILS,
  trainingPolishWorkoutHistoryV2Range,
} from './trainingPolishWorkoutHistoryV2Suite'

describe('trainingPolishWorkoutHistoryV2Suite', () => {
  it('pivot historial v2 oleadas 440–448', () => {
    expect(countTrainingPolishWorkoutHistoryV2Utils()).toBe(3)
    expect(trainingPolishWorkoutHistoryV2Range()).toEqual({ from: 440, to: 448 })
    expect(TRAINING_POLISH_WORKOUT_HISTORY_V2_UTILS.map((e) => e.id)).toEqual([
      'history-row-pr-tone',
      'post-v2-closure',
      'sparkline-pr-tone',
    ])
    expect(isTrainingPolishWorkoutHistoryV2Open()).toBe(true)
    expect(isTrainingPolishWorkoutHistoryV2Open(439)).toBe(false)
    expect(isTrainingPolishWorkoutHistoryV2Closed()).toBe(true)
    expect(isTrainingPolishWorkoutHistoryV2Closed(442)).toBe(false)
  })
})