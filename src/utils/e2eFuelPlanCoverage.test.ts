import { describe, expect, it } from 'vitest'
import {
  countE2EFuelPlanSpecs,
  E2E_FUEL_PLAN_SPECS,
  e2eFuelPlanBlockRange,
  e2eFuelPlanSpecIds,
  fuelPlanNutritionSpecIds,
  fuelPlanSpecFileBasenames,
  isFuelPlanE2ECoverageComplete,
  isFuelPlanNutritionE2ECovered,
  isFuelPlanNutritionE2ETrilogyComplete,
  unionFuelPlanCovers,
} from './e2eFuelPlanCoverage'

describe('e2eFuelPlanCoverage', () => {
  it('consolida 3 specs E2E Fuel×EntrenaPlan (oleada 414)', () => {
    expect(countE2EFuelPlanSpecs()).toBe(3)
    expect(e2eFuelPlanBlockRange()).toEqual({ from: 412, to: 429 })
    expect(e2eFuelPlanSpecIds()).toEqual([
      'training-mega-flow',
      'workout-plan-history-flow',
      'workout-fuel-flow',
    ])
  })

  it('unionFuelPlanCovers y cobertura mínima', () => {
    expect(unionFuelPlanCovers().sort()).toEqual(
      [
        'fuel-aria',
        'fuel-chip',
        'fuel-headline',
        'fuel-row-tone',
        'fuel-scenario',
        'fuel-hint',
        'fuel-nutrition',
        'fuel-tone',
        'fuel-tone-stack',
        'fuel-nutrition-tone',
        'fuel-tone-expected',
        'fuel-tone-aria',
        'fuel-tone-card',
        'fuel-tone-full',
      ].sort()
    )
    const planHistory = E2E_FUEL_PLAN_SPECS.find((s) => s.id === 'workout-plan-history-flow')
    expect(isFuelPlanE2ECoverageComplete(planHistory?.covers ?? [])).toBe(true)
    expect(isFuelPlanNutritionE2ECovered()).toBe(true)
    expect(isFuelPlanNutritionE2ETrilogyComplete()).toBe(true)
    expect(fuelPlanNutritionSpecIds()).toEqual([
      'training-mega-flow',
      'workout-plan-history-flow',
      'workout-fuel-flow',
    ])
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