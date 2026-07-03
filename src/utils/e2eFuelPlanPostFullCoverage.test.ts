import { describe, expect, it } from 'vitest'
import {
  countFuelPlanPostFullCoverageModules,
  e2eFuelPlanPostFullBlockRange,
  FUEL_PLAN_POST_FULL_COVERAGE_MODULES,
  isFuelPlanPostFullE2ECoverageComplete,
} from './e2eFuelPlanPostFullCoverage'

describe('e2eFuelPlanPostFullCoverage', () => {
  it('cierre post-full Fuel×EntrenaPlan oleadas 421–427', () => {
    expect(countFuelPlanPostFullCoverageModules()).toBe(6)
    expect(e2eFuelPlanPostFullBlockRange()).toEqual({ from: 421, to: 427 })
    expect([...FUEL_PLAN_POST_FULL_COVERAGE_MODULES]).toEqual([
      'e2eFuelPlanScenarioCoverage',
      'e2eFuelPlanToneCoverage',
      'weeklyPlanFuelToneStackDisplay',
      'weeklyPlanFuelToneStackExpectedDisplay',
      'weeklyPlanFuelToneStackAriaDisplay',
      'weeklyPlanFuelToneStackCardDisplay',
    ])
    expect(isFuelPlanPostFullE2ECoverageComplete()).toBe(true)
  })
})