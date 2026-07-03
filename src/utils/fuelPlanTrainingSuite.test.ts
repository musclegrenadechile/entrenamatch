import { describe, expect, it } from 'vitest'
import {
  countFuelPlanTrainingUtils,
  fuelPlanTrainingBlockRange,
  FUEL_PLAN_TRAINING_UTILS,
} from './fuelPlanTrainingSuite'

describe('fuelPlanTrainingSuite', () => {
  it('inventario Fuel×plan oleada 411', () => {
    expect(countFuelPlanTrainingUtils()).toBe(1)
    expect(fuelPlanTrainingBlockRange()).toEqual({ from: 411, to: 411 })
    expect(FUEL_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain('weeklyPlanFuelWeekDisplay')
  })
})