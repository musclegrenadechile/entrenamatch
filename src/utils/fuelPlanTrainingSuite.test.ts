import { describe, expect, it } from 'vitest'
import {
  countFuelPlanTrainingUtils,
  fuelPlanTrainingBlockRange,
  FUEL_PLAN_TRAINING_UTILS,
  isFuelPlanTrainingBlockClosed,
} from './fuelPlanTrainingSuite'

describe('fuelPlanTrainingSuite', () => {
  it('inventario Fuel×plan oleadas 411–418', () => {
    expect(countFuelPlanTrainingUtils()).toBe(18)
    expect(fuelPlanTrainingBlockRange()).toEqual({ from: 411, to: 418 })
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
  })
})