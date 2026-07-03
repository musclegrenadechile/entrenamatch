import { describe, expect, it } from 'vitest'
import {
  countWorkoutHistoryTrainingUtils,
  WORKOUT_HISTORY_TRAINING_UTILS,
  workoutHistoryTrainingBlockRange,
} from './workoutHistoryTrainingSuite'

describe('workoutHistoryTrainingSuite', () => {
  it('inventario historial oleadas 395–453', () => {
    expect(countWorkoutHistoryTrainingUtils()).toBe(19)
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.oleada)).toEqual([
      395, 395, 396, 397, 440, 440, 440, 443, 443, 443, 448, 448, 449, 449, 449, 452, 452, 452, 453,
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
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain('e2eWorkoutHistoryCoverage')
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eWorkoutHistoryPostV2Coverage'
    )
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eWorkoutHistoryFullCoverage'
    )
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain(
      'workoutHistorySparklinePrToneDisplay'
    )
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eWorkoutHistorySparklinePrCoverage'
    )
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eWorkoutHistorySparklineCoverage'
    )
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eWorkoutHistorySparklinePostV2Coverage'
    )
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eWorkoutHistorySparklineFullCoverage'
    )
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain(
      'trainingWorkoutHistoryV2GlobalClosure'
    )
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain(
      'trainingPolishWorkoutHistoryV2GlobalSuite'
    )
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eWorkoutHistoryV2GlobalCoverage'
    )
    expect(WORKOUT_HISTORY_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eWorkoutHistoryV2GlobalFullCoverage'
    )
  })

  it('bloque oleadas 395–453', () => {
    expect(workoutHistoryTrainingBlockRange()).toEqual({ from: 395, to: 453 })
    const suite = WORKOUT_HISTORY_TRAINING_UTILS.find((u) => u.id === 'history-suite')
    expect(suite?.covers).toContain('a11y')
  })
})