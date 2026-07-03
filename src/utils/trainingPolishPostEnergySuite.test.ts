import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPostEnergyUtils,
  isTrainingPolishPostEnergyOpen,
  TRAINING_POLISH_POST_ENERGY_UTILS,
  trainingPolishPostEnergyRange,
} from './trainingPolishPostEnergySuite'

describe('trainingPolishPostEnergySuite', () => {
  it('mega fase VII oleada 433', () => {
    expect(countTrainingPolishPostEnergyUtils()).toBe(1)
    expect(trainingPolishPostEnergyRange()).toEqual({ from: 433, to: 433 })
    expect(TRAINING_POLISH_POST_ENERGY_UTILS.map((e) => e.id)).toEqual(['fuel-energy-tone'])
    expect(isTrainingPolishPostEnergyOpen()).toBe(true)
    expect(isTrainingPolishPostEnergyOpen(432)).toBe(false)
  })
})