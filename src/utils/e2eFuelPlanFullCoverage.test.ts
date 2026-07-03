import { describe, expect, it } from 'vitest'
import {
  countFuelPlanCoverageSuites,
  e2eFuelPlanFullBlockRange,
  FUEL_PLAN_FULL_COVERAGE_MODULES,
  isFuelPlanFullE2ECoverageComplete,
} from './e2eFuelPlanFullCoverage'

describe('e2eFuelPlanFullCoverage', () => {
  it('unifica 7 suites E2E Fuel×EntrenaPlan (oleada 420–429)', () => {
    expect(countFuelPlanCoverageSuites()).toBe(7)
    expect(e2eFuelPlanFullBlockRange()).toEqual({ from: 412, to: 429 })
    expect([...FUEL_PLAN_FULL_COVERAGE_MODULES]).toEqual([
      'e2eFuelPlanCoverage',
      'e2eFuelPlanNutritionCoverage',
      'e2eFuelPlanHeadlineCoverage',
      'e2eFuelPlanScenarioCoverage',
      'e2eFuelPlanToneCoverage',
      'e2eFuelPlanPostFullCoverage',
      'e2eFuelPlanPostStackCoverage',
    ])
    expect(isFuelPlanFullE2ECoverageComplete()).toBe(true)
  })
})