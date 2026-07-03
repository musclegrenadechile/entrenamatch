import { describe, expect, it } from 'vitest'
import {
  countPostWorkoutTrainingUtils,
  POST_WORKOUT_TRAINING_UTILS,
  postWorkoutTrainingBlockRange,
} from './postWorkoutTrainingSuite'

describe('postWorkoutTrainingSuite', () => {
  it('inventario post-entreno oleadas 390–450', () => {
    expect(countPostWorkoutTrainingUtils()).toBe(21)
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.oleada)).toEqual([
      390, 391, 392, 393, 394, 439, 439, 439, 441, 441, 442, 442, 442, 445, 445, 445, 446,
      446, 446, 450, 450,
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
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eTrainingReviewCoverage'
    )
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eTrainingReviewPostV2Coverage'
    )
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eTrainingReviewFullCoverage'
    )
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain('trainingReviewSessionPr')
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eTrainingFullFlowPrCoverage'
    )
  })

  it('bloque oleadas 390–450', () => {
    expect(postWorkoutTrainingBlockRange()).toEqual({ from: 390, to: 450 })
    const suite = POST_WORKOUT_TRAINING_UTILS.find((u) => u.id === 'post-workout-suite')
    expect(suite?.covers).toContain('fuel-prefill')
  })
})