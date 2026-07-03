import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPostFuelUtils,
  isTrainingPolishPostFuelClosed,
  TRAINING_POLISH_POST_FUEL_UTILS,
  trainingPolishPostFuelRange,
} from './trainingPolishPostFuelSuite'

describe('trainingPolishPostFuelSuite', () => {
  it('inventario post-fuel oleada 430', () => {
    expect(countTrainingPolishPostFuelUtils()).toBe(1)
    expect(trainingPolishPostFuelRange()).toEqual({ from: 430, to: 430 })
    expect(isTrainingPolishPostFuelClosed()).toBe(true)
    expect(TRAINING_POLISH_POST_FUEL_UTILS.map((e) => e.id)).toEqual(['fuel-history-tone'])
  })
})