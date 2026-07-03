import { describe, expect, it } from 'vitest'
import {
  countE2EFuelPlanSpecs,
  E2E_FUEL_PLAN_SPECS,
  e2eFuelPlanBlockRange,
  e2eFuelPlanSpecIds,
  fuelPlanSpecFileBasenames,
  isFuelPlanE2ECoverageComplete,
  unionFuelPlanCovers,
} from './e2eFuelPlanCoverage'

describe('e2eFuelPlanCoverage', () => {
  it('consolida 3 specs E2E Fuel×EntrenaPlan (oleada 414)', () => {
    expect(countE2EFuelPlanSpecs()).toBe(3)
    expect(e2eFuelPlanBlockRange()).toEqual({ from: 412, to: 414 })
    expect(e2eFuelPlanSpecIds()).toEqual([
      'training-mega-flow',
      'workout-plan-history-flow',
      'workout-fuel-flow',
    ])
  })

  it('unionFuelPlanCovers y cobertura mínima', () => {
    expect(unionFuelPlanCovers()).toEqual([
      'fuel-hint',
      'fuel-aria',
      'fuel-tone',
      'fuel-chip',
    ])
    const planHistory = E2E_FUEL_PLAN_SPECS.find((s) => s.id === 'workout-plan-history-flow')
    expect(isFuelPlanE2ECoverageComplete(planHistory?.covers ?? [])).toBe(true)
    const fuelFlow = E2E_FUEL_PLAN_SPECS.find((s) => s.id === 'workout-fuel-flow')
    expect(isFuelPlanE2ECoverageComplete(fuelFlow?.covers ?? [])).toBe(true)
    const mega = E2E_FUEL_PLAN_SPECS.find((s) => s.id === 'training-mega-flow')
    expect(isFuelPlanE2ECoverageComplete(mega?.covers ?? [])).toBe(false)
  })

  it('fuelPlanSpecFileBasenames para CI e2e-smoke (oleada 414)', () => {
    expect(fuelPlanSpecFileBasenames()).toEqual([
      'training-mega-flow.spec.ts',
      'workout-plan-history-flow.spec.ts',
      'workout-fuel-flow.spec.ts',
    ])
  })
})