import { describe, expect, it } from 'vitest'
import {
  countPostWorkoutTrainingUtils,
  POST_WORKOUT_TRAINING_UTILS,
  postWorkoutTrainingBlockRange,
} from './postWorkoutTrainingSuite'

describe('postWorkoutTrainingSuite', () => {
  it('inventario post-entreno oleadas 390–445', () => {
    expect(countPostWorkoutTrainingUtils()).toBe(16)
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.oleada)).toEqual([
      390, 391, 392, 393, 394, 439, 439, 439, 441, 441, 442, 442, 442, 445, 445, 445,
    ])
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain(
      'workoutSaveBannerPrToneDisplay'
    )
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eWorkoutSaveBannerPrCoverage'
    )
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain(
      'trainingPolishPostWorkoutV2Suite'
    )
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain(
      'fuelLogPrefillPrToneDisplay'
    )
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eFuelLogPrefillPrCoverage'
    )
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain('e2ePostWorkoutCoverage')
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2ePostWorkoutPostV2Coverage'
    )
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2ePostWorkoutFullCoverage'
    )
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain(
      'trainingReviewPrToneDisplay'
    )
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eTrainingReviewPrCoverage'
    )
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain(
      'trainingPolishReviewV2Suite'
    )
  })

  it('bloque oleadas 390–445', () => {
    expect(postWorkoutTrainingBlockRange()).toEqual({ from: 390, to: 445 })
    const suite = POST_WORKOUT_TRAINING_UTILS.find((u) => u.id === 'post-workout-suite')
    expect(suite?.covers).toContain('fuel-prefill')
  })
})