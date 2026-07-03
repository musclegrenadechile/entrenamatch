import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPostFullUtils,
  isTrainingPolishPostFullClosed,
  trainingPolishPostFullRange,
  TRAINING_POLISH_POST_FULL_UTILS,
} from './trainingPolishPostFullSuite'

describe('trainingPolishPostFullSuite', () => {
  it('inventario post-full 421–425 cerrado', () => {
    expect(countTrainingPolishPostFullUtils()).toBe(7)
    expect(trainingPolishPostFullRange()).toEqual({ from: 421, to: 425 })
    expect(isTrainingPolishPostFullClosed()).toBe(true)
    expect(TRAINING_POLISH_POST_FULL_UTILS.map((e) => e.module)).toContain(
      'weeklyPlanFuelScenarioSync'
    )
    expect(TRAINING_POLISH_POST_FULL_UTILS.map((e) => e.module)).toContain(
      'e2eFuelPlanScenarioCoverage'
    )
    expect(TRAINING_POLISH_POST_FULL_UTILS.map((e) => e.module)).toContain(
      'weeklyPlanFuelRowToneDisplay'
    )
    expect(TRAINING_POLISH_POST_FULL_UTILS.map((e) => e.module)).toContain(
      'weeklyPlanFuelToneStackDisplay'
    )
    expect(TRAINING_POLISH_POST_FULL_UTILS.map((e) => e.module)).toContain(
      'e2eFuelPlanToneCoverage'
    )
    expect(TRAINING_POLISH_POST_FULL_UTILS.map((e) => e.module)).toContain(
      'weeklyPlanNutritionToneDisplay'
    )
    expect(TRAINING_POLISH_POST_FULL_UTILS.map((e) => e.module)).toContain(
      'weeklyPlanFuelToneStackExpectedDisplay'
    )
  })
})