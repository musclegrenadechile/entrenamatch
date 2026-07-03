import { describe, expect, it } from 'vitest'
import {
  countPostWorkoutTrainingUtils,
  POST_WORKOUT_TRAINING_UTILS,
  postWorkoutTrainingBlockRange,
} from './postWorkoutTrainingSuite'

describe('postWorkoutTrainingSuite', () => {
  it('inventario post-entreno oleadas 390–441', () => {
    expect(countPostWorkoutTrainingUtils()).toBe(10)
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.oleada)).toEqual([
      390, 391, 392, 393, 394, 439, 439, 439, 441, 441,
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
  })

  it('bloque oleadas 390–441', () => {
    expect(postWorkoutTrainingBlockRange()).toEqual({ from: 390, to: 441 })
    const suite = POST_WORKOUT_TRAINING_UTILS.find((u) => u.id === 'post-workout-suite')
    expect(suite?.covers).toContain('fuel-prefill')
  })
})