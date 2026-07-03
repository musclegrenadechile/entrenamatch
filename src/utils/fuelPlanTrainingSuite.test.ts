import { describe, expect, it } from 'vitest'
import {
  countFuelPlanTrainingUtils,
  fuelPlanTrainingBlockRange,
  FUEL_PLAN_TRAINING_UTILS,
  isFuelPlanTrainingBlockClosed,
} from './fuelPlanTrainingSuite'

describe('fuelPlanTrainingSuite', () => {
  it('inventario Fuel×plan oleadas 411–424', () => {
    expect(countFuelPlanTrainingUtils()).toBe(27)
    expect(fuelPlanTrainingBlockRange()).toEqual({ from: 411, to: 424 })
    expect(isFuelPlanTrainingBlockClosed()).toBe(true)
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanFuelWeekDisplay')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanFuelWeekToneDisplay')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanFuelWeekChipDisplay')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('demoFuelWeekLogs')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('e2eFuelPlanCoverage')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanNutritionDisplay')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('trainingPolishPostMegaSuite')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanHeadlineFuelDisplay')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('e2eFuelPlanNutritionCoverage')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('e2eFuelPlanHeadlineCoverage')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('e2eFuelPlanFullCoverage')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanFuelScenarioSync')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('e2eFuelPlanScenarioCoverage')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanFuelRowToneDisplay')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanFuelToneStackDisplay')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('e2eFuelPlanToneCoverage')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanNutritionToneDisplay')
  })
})