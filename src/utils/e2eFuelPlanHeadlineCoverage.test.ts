import { describe, expect, it } from 'vitest'
import {
  countE2EFuelPlanHeadlineSpecs,
  e2eFuelPlanHeadlineBlockRange,
  e2eFuelPlanHeadlineSpecIds,
  fuelPlanHeadlineSpecFileBasenames,
  isFuelPlanHeadlineCoverageComplete,
  unionFuelPlanHeadlineCovers,
} from './e2eFuelPlanHeadlineCoverage'

describe('e2eFuelPlanHeadlineCoverage', () => {
  it('consolida 3 specs headline Fuel×EntrenaPlan (oleada 419)', () => {
    expect(countE2EFuelPlanHeadlineSpecs()).toBe(3)
    expect(e2eFuelPlanHeadlineBlockRange()).toEqual({ from: 418, to: 419 })
    expect(e2eFuelPlanHeadlineSpecIds()).toEqual([
      'training-mega-flow',
      'workout-plan-history-flow',
      'workout-fuel-flow',
    ])
    expect(isFuelPlanHeadlineCoverageComplete()).toBe(true)
  })

  it('unionFuelPlanHeadlineCovers', () => {
    expect(unionFuelPlanHeadlineCovers().sort()).toEqual(
      ['aria', 'headline', 'scenario', 'tone'].sort()
    )
  })

  it('fuelPlanHeadlineSpecFileBasenames para CI e2e-smoke (oleada 419)', () => {
    expect(fuelPlanHeadlineSpecFileBasenames()).toEqual([
      'training-mega-flow.spec.ts',
      'workout-plan-history-flow.spec.ts',
      'workout-fuel-flow.spec.ts',
    ])
  })
})