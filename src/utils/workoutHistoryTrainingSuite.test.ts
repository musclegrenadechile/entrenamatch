import { describe, expect, it } from 'vitest'
import {
  countWorkoutHistoryTrainingUtils,
  WORKOUT_HISTORY_TRAINING_UTILS,
  workoutHistoryTrainingBlockRange,
} from './workoutHistoryTrainingSuite'

describe('workoutHistoryTrainingSuite', () => {
  it('inventario historial oleadas 395–440', () => {
    expect(countWorkoutHistoryTrainingUtils()).toBe(7)
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.oleada)).toEqual([
      395, 395, 396, 397, 440, 440, 440,
    ])
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain(
      'workoutHistoryRowPrToneDisplay'
    )
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eWorkoutHistoryRowPrCoverage'
    )
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain(
      'trainingPolishWorkoutHistoryV2Suite'
    )
  })

  it('bloque oleadas 395–440', () => {
    expect(workoutHistoryTrainingBlockRange()).toEqual({ from: 395, to: 440 })
    const suite = WORKOUT_HISTORY_TRAINING_UTILS.find((u) => u.id === 'history-suite')
    expect(suite?.covers).toContain('a11y')
  })
})