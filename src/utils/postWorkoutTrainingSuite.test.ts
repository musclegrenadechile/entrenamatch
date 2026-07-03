import { describe, expect, it } from 'vitest'
import {
  countPostWorkoutTrainingUtils,
  POST_WORKOUT_TRAINING_UTILS,
  postWorkoutTrainingBlockRange,
} from './postWorkoutTrainingSuite'

describe('postWorkoutTrainingSuite', () => {
  it('inventario de 5 utils post-entreno', () => {
    expect(countPostWorkoutTrainingUtils()).toBe(5)
    expect(POST_WORKOUT_TRAINING_UTILS.map((u) => u.oleada)).toEqual([390, 391, 392, 393, 394])
  })

  it('bloque oleadas 390–394', () => {
    expect(postWorkoutTrainingBlockRange()).toEqual({ from: 390, to: 394 })
    const suite = POST_WORKOUT_TRAINING_UTILS.find((u) => u.id === 'post-workout-suite')
    expect(suite?.covers).toContain('fuel-prefill')
  })
})