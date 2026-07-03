import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPostWorkoutV2Utils,
  isTrainingPolishPostWorkoutV2Open,
  TRAINING_POLISH_POST_WORKOUT_V2_UTILS,
  trainingPolishPostWorkoutV2Range,
} from './trainingPolishPostWorkoutV2Suite'

describe('trainingPolishPostWorkoutV2Suite', () => {
  it('pivot post-entreno v2 oleadas 439–441', () => {
    expect(countTrainingPolishPostWorkoutV2Utils()).toBe(2)
    expect(trainingPolishPostWorkoutV2Range()).toEqual({ from: 439, to: 441 })
    expect(TRAINING_POLISH_POST_WORKOUT_V2_UTILS.map((e) => e.id)).toEqual([
      'banner-pr-tone',
      'fuel-prefill-pr-tone',
    ])
    expect(isTrainingPolishPostWorkoutV2Open()).toBe(true)
    expect(isTrainingPolishPostWorkoutV2Open(438)).toBe(false)
  })
})