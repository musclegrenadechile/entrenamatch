import { describe, expect, it } from 'vitest'
import {
  countFuelPlanTrainingUtils,
  fuelPlanTrainingBlockRange,
  FUEL_PLAN_TRAINING_UTILS,
  isFuelPlanTrainingBlockClosed,
} from './fuelPlanTrainingSuite'

describe('fuelPlanTrainingSuite', () => {
  it('inventario Fuel×plan oleadas 411–415', () => {
    expect(countFuelPlanTrainingUtils()).toBe(11)
    expect(fuelPlanTrainingBlockRange()).toEqual({ from: 411, to: 415 })
    expect(isFuelPlanTrainingBlockClosed()).toBe(true)
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanFuelWeekDisplay')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanFuelWeekToneDisplay')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanFuelWeekChipDisplay')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('demoFuelWeekLogs')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('e2eFuelPlanCoverage')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanNutritionDisplay')
  })
})