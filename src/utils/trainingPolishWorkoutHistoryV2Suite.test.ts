import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishWorkoutHistoryV2Utils,
  isTrainingPolishWorkoutHistoryV2Closed,
  isTrainingPolishWorkoutHistoryV2Open,
  TRAINING_POLISH_WORKOUT_HISTORY_V2_UTILS,
  trainingPolishWorkoutHistoryV2Range,
} from './trainingPolishWorkoutHistoryV2Suite'

describe('trainingPolishWorkoutHistoryV2Suite', () => {
  it('pivot historial v2 oleadas 440–443', () => {
    expect(countTrainingPolishWorkoutHistoryV2Utils()).toBe(2)
    expect(trainingPolishWorkoutHistoryV2Range()).toEqual({ from: 440, to: 443 })
    expect(TRAINING_POLISH_WORKOUT_HISTORY_V2_UTILS.map((e) => e.id)).toEqual([
      'history-row-pr-tone',
      'post-v2-closure',
    ])
    expect(isTrainingPolishWorkoutHistoryV2Open()).toBe(true)
    expect(isTrainingPolishWorkoutHistoryV2Open(439)).toBe(false)
    expect(isTrainingPolishWorkoutHistoryV2Closed()).toBe(true)
    expect(isTrainingPolishWorkoutHistoryV2Closed(442)).toBe(false)
  })
})