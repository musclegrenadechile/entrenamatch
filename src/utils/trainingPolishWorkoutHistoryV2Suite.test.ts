import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishWorkoutHistoryV2Utils,
  isTrainingPolishWorkoutHistoryV2Closed,
  isTrainingPolishWorkoutHistoryV2GlobalClosed,
  isTrainingPolishWorkoutHistoryV2Open,
  isTrainingPolishWorkoutHistoryV2RowClosed,
  TRAINING_POLISH_WORKOUT_HISTORY_V2_UTILS,
  trainingPolishWorkoutHistoryV2Range,
} from './trainingPolishWorkoutHistoryV2Suite'

describe('trainingPolishWorkoutHistoryV2Suite', () => {
  it('pivot historial v2 oleadas 440–452', () => {
    expect(countTrainingPolishWorkoutHistoryV2Utils()).toBe(5)
    expect(trainingPolishWorkoutHistoryV2Range()).toEqual({ from: 440, to: 449 })
    expect(TRAINING_POLISH_WORKOUT_HISTORY_V2_UTILS.map((e) => e.id)).toEqual([
      'history-row-pr-tone',
      'post-v2-closure',
      'sparkline-pr-tone',
      'sparkline-post-v2-closure',
      'history-v2-global-closure',
    ])
    expect(isTrainingPolishWorkoutHistoryV2Open()).toBe(true)
    expect(isTrainingPolishWorkoutHistoryV2Open(439)).toBe(false)
    expect(isTrainingPolishWorkoutHistoryV2RowClosed()).toBe(true)
    expect(isTrainingPolishWorkoutHistoryV2RowClosed(442)).toBe(false)
    expect(isTrainingPolishWorkoutHistoryV2Closed()).toBe(true)
    expect(isTrainingPolishWorkoutHistoryV2Closed(448)).toBe(false)
    expect(isTrainingPolishWorkoutHistoryV2GlobalClosed()).toBe(true)
    expect(isTrainingPolishWorkoutHistoryV2GlobalClosed(451)).toBe(false)
  })
})