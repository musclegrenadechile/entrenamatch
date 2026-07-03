import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPostStackUtils,
  isTrainingPolishPostStackClosed,
  TRAINING_POLISH_POST_STACK_UTILS,
  trainingPolishPostStackRange,
} from './trainingPolishPostStackSuite'

describe('trainingPolishPostStackSuite', () => {
  it('inventario post-stack oleadas 428–429 cerrado', () => {
    expect(countTrainingPolishPostStackUtils()).toBe(2)
    expect(trainingPolishPostStackRange()).toEqual({ from: 428, to: 429 })
    expect(isTrainingPolishPostStackClosed()).toBe(true)
    expect(isTrainingPolishPostStackClosed(428)).toBe(false)
    expect(TRAINING_POLISH_POST_STACK_UTILS.map((e) => e.id)).toEqual([
      'fuel-tone-full',
      'post-stack-closure',
    ])
  })
})