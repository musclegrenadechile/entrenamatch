import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPostEnergyUtils,
  isTrainingPolishPostEnergyClosed,
  TRAINING_POLISH_POST_ENERGY_UTILS,
  trainingPolishPostEnergyRange,
} from './trainingPolishPostEnergySuite'

describe('trainingPolishPostEnergySuite', () => {
  it('mega fase VII oleadas 433–434', () => {
    expect(countTrainingPolishPostEnergyUtils()).toBe(2)
    expect(trainingPolishPostEnergyRange()).toEqual({ from: 433, to: 434 })
    expect(TRAINING_POLISH_POST_ENERGY_UTILS.map((e) => e.id)).toEqual([
      'fuel-energy-tone',
      'post-energy-closure',
    ])
    expect(isTrainingPolishPostEnergyClosed()).toBe(true)
    expect(isTrainingPolishPostEnergyClosed(433)).toBe(false)
  })
})