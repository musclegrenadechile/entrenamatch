import { describe, expect, it } from 'vitest'
import {
  countFuelPlanPostEnergyCoverageModules,
  e2eFuelPlanPostEnergyBlockRange,
  FUEL_PLAN_POST_ENERGY_COVERAGE_MODULES,
  isFuelPlanPostEnergyE2ECoverageComplete,
} from './e2eFuelPlanPostEnergyCoverage'

describe('e2eFuelPlanPostEnergyCoverage', () => {
  it('cierre post-energy Fuel×energía oleadas 433–434', () => {
    expect(countFuelPlanPostEnergyCoverageModules()).toBe(2)
    expect(e2eFuelPlanPostEnergyBlockRange()).toEqual({ from: 433, to: 434 })
    expect([...FUEL_PLAN_POST_ENERGY_COVERAGE_MODULES]).toEqual([
      'weeklyPlanFuelEnergySummaryToneDisplay',
      'e2eFuelPlanEnergySummaryToneCoverage',
    ])
    expect(isFuelPlanPostEnergyE2ECoverageComplete()).toBe(true)
  })
})