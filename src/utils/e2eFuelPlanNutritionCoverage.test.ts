import { describe, expect, it } from 'vitest'
import {
  countE2EFuelPlanNutritionSpecs,
  e2eFuelPlanNutritionBlockRange,
  e2eFuelPlanNutritionSpecIds,
  fuelPlanNutritionSpecFileBasenames,
  isFuelPlanNutritionCoverageComplete,
  unionFuelPlanNutritionCovers,
} from './e2eFuelPlanNutritionCoverage'

describe('e2eFuelPlanNutritionCoverage', () => {
  it('consolida 3 specs nutrición Fuel×EntrenaPlan (oleada 424)', () => {
    expect(countE2EFuelPlanNutritionSpecs()).toBe(3)
    expect(e2eFuelPlanNutritionBlockRange()).toEqual({ from: 415, to: 424 })
    expect(e2eFuelPlanNutritionSpecIds()).toEqual([
      'training-mega-flow',
      'workout-plan-history-flow',
      'workout-fuel-flow',
    ])
    expect(isFuelPlanNutritionCoverageComplete()).toBe(true)
  })

  it('unionFuelPlanNutritionCovers', () => {
    expect(unionFuelPlanNutritionCovers().sort()).toEqual(
      ['aria', 'nutrition', 'nutrition-tone', 'scenario'].sort()
    )
  })

  it('fuelPlanNutritionSpecFileBasenames para CI e2e-smoke (oleada 418)', () => {
    expect(fuelPlanNutritionSpecFileBasenames()).toEqual([
      'training-mega-flow.spec.ts',
      'workout-plan-history-flow.spec.ts',
      'workout-fuel-flow.spec.ts',
    ])
  })
})