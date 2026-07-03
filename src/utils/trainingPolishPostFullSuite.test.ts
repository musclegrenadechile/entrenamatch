import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPostFullUtils,
  isTrainingPolishPostFullClosed,
  trainingPolishPostFullRange,
  TRAINING_POLISH_POST_FULL_UTILS,
} from './trainingPolishPostFullSuite'

describe('trainingPolishPostFullSuite', () => {
  it('inventario post-full 421 cerrado', () => {
    expect(countTrainingPolishPostFullUtils()).toBe(2)
    expect(trainingPolishPostFullRange()).toEqual({ from: 421, to: 421 })
    expect(isTrainingPolishPostFullClosed()).toBe(true)
    expect(TRAINING_POLISH_POST_FULL_UTILS.map((e) => e.module)).toContain(
      'weeklyPlanFuelScenarioSync'
    )
    expect(TRAINING_POLISH_POST_FULL_UTILS.map((e) => e.module)).toContain(
      'e2eFuelPlanScenarioCoverage'
    )
  })
})