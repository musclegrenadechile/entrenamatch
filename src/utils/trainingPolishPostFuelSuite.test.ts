import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPostFuelUtils,
  isTrainingPolishPostFuelClosed,
  TRAINING_POLISH_POST_FUEL_UTILS,
  trainingPolishPostFuelRange,
} from './trainingPolishPostFuelSuite'

describe('trainingPolishPostFuelSuite', () => {
  it('inventario post-fuel oleadas 430–432 cerrado', () => {
    expect(countTrainingPolishPostFuelUtils()).toBe(3)
    expect(trainingPolishPostFuelRange()).toEqual({ from: 430, to: 432 })
    expect(isTrainingPolishPostFuelClosed()).toBe(true)
    expect(isTrainingPolishPostFuelClosed(431)).toBe(false)
    expect(TRAINING_POLISH_POST_FUEL_UTILS.map((e) => e.id)).toEqual([
      'fuel-history-tone',
      'fuel-rotation-tone',
      'post-fuel-closure',
    ])
  })
})