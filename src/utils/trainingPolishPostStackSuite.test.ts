import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPostStackUtils,
  isTrainingPolishPostStackClosed,
  TRAINING_POLISH_POST_STACK_UTILS,
  trainingPolishPostStackRange,
} from './trainingPolishPostStackSuite'

describe('trainingPolishPostStackSuite', () => {
  it('inventario post-stack oleada 428', () => {
    expect(countTrainingPolishPostStackUtils()).toBe(1)
    expect(trainingPolishPostStackRange()).toEqual({ from: 428, to: 428 })
    expect(isTrainingPolishPostStackClosed()).toBe(true)
    expect(isTrainingPolishPostStackClosed(427)).toBe(false)
    expect(TRAINING_POLISH_POST_STACK_UTILS.map((e) => e.id)).toEqual(['fuel-tone-full'])
  })
})