import { describe, expect, it } from 'vitest'
import {
  countFuelPlanTrainingUtils,
  fuelPlanTrainingBlockRange,
  FUEL_PLAN_TRAINING_UTILS,
} from './fuelPlanTrainingSuite'

describe('fuelPlanTrainingSuite', () => {
  it('inventario Fuel×plan oleadas 411–412', () => {
    expect(countFuelPlanTrainingUtils()).toBe(3)
    expect(fuelPlanTrainingBlockRange()).toEqual({ from: 411, to: 412 })
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanFuelWeekDisplay')
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanFuelWeekToneDisplay')
  })
})