import { describe, expect, it } from 'vitest'
import {
  countWorkoutHistoryTrainingUtils,
  WORKOUT_HISTORY_TRAINING_UTILS,
  workoutHistoryTrainingBlockRange,
} from './workoutHistoryTrainingSuite'

describe('workoutHistoryTrainingSuite', () => {
  it('inventario de 4 utils historial', () => {
    expect(countWorkoutHistoryTrainingUtils()).toBe(4)
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.oleada)).toEqual([395, 395, 396, 397])
  })

  it('bloque oleadas 395–397', () => {
    expect(workoutHistoryTrainingBlockRange()).toEqual({ from: 395, to: 397 })
    const suite = WORKOUT_HISTORY_TRAINING_UTILS.find((u) => u.id === 'history-suite')
    expect(suite?.covers).toContain('a11y')
  })
})