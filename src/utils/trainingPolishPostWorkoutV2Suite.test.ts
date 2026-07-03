import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPostWorkoutV2Utils,
  isTrainingPolishPostWorkoutV2Closed,
  isTrainingPolishPostWorkoutV2Open,
  TRAINING_POLISH_POST_WORKOUT_V2_UTILS,
  trainingPolishPostWorkoutV2Range,
} from './trainingPolishPostWorkoutV2Suite'

describe('trainingPolishPostWorkoutV2Suite', () => {
  it('pivot post-entreno v2 oleadas 439–442', () => {
    expect(countTrainingPolishPostWorkoutV2Utils()).toBe(3)
    expect(trainingPolishPostWorkoutV2Range()).toEqual({ from: 439, to: 442 })
    expect(TRAINING_POLISH_POST_WORKOUT_V2_UTILS.map((e) => e.id)).toEqual([
      'banner-pr-tone',
      'fuel-prefill-pr-tone',
      'post-v2-closure',
    ])
    expect(isTrainingPolishPostWorkoutV2Open()).toBe(true)
    expect(isTrainingPolishPostWorkoutV2Open(438)).toBe(false)
    expect(isTrainingPolishPostWorkoutV2Closed()).toBe(true)
    expect(isTrainingPolishPostWorkoutV2Closed(441)).toBe(false)
  })
})