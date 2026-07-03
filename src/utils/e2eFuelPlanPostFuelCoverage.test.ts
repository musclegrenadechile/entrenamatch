import { describe, expect, it } from 'vitest'
import {
  countFuelPlanPostFuelCoverageModules,
  e2eFuelPlanPostFuelBlockRange,
  FUEL_PLAN_POST_FUEL_COVERAGE_MODULES,
  isFuelPlanPostFuelE2ECoverageComplete,
} from './e2eFuelPlanPostFuelCoverage'

describe('e2eFuelPlanPostFuelCoverage', () => {
  it('cierre post-fuel EntrenaPlan×historial oleadas 430–432', () => {
    expect(countFuelPlanPostFuelCoverageModules()).toBe(4)
    expect(e2eFuelPlanPostFuelBlockRange()).toEqual({ from: 430, to: 432 })
    expect([...FUEL_PLAN_POST_FUEL_COVERAGE_MODULES]).toEqual([
      'weeklyPlanFuelHistoryToneDisplay',
      'weeklyPlanFuelRotationToneDisplay',
      'e2eFuelPlanHistoryToneCoverage',
      'e2eFuelPlanRotationToneCoverage',
    ])
    expect(isFuelPlanPostFuelE2ECoverageComplete()).toBe(true)
  })
})