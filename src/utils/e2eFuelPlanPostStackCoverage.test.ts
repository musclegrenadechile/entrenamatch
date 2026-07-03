import { describe, expect, it } from 'vitest'
import {
  countFuelPlanPostStackCoverageModules,
  e2eFuelPlanPostStackBlockRange,
  FUEL_PLAN_POST_STACK_COVERAGE_MODULES,
  isFuelPlanPostStackE2ECoverageComplete,
} from './e2eFuelPlanPostStackCoverage'

describe('e2eFuelPlanPostStackCoverage', () => {
  it('cierre post-stack Fuel×EntrenaPlan oleadas 428–429', () => {
    expect(countFuelPlanPostStackCoverageModules()).toBe(3)
    expect(e2eFuelPlanPostStackBlockRange()).toEqual({ from: 428, to: 429 })
    expect([...FUEL_PLAN_POST_STACK_COVERAGE_MODULES]).toEqual([
      'weeklyPlanFuelToneStackFullDisplay',
      'e2eFuelPlanToneCoverage',
      'weeklyPlanFuelToneStackCardDisplay',
    ])
    expect(isFuelPlanPostStackE2ECoverageComplete()).toBe(true)
  })
})