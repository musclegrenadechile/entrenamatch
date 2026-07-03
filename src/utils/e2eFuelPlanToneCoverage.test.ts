import { describe, expect, it } from 'vitest'
import {
  countE2EFuelPlanToneSpecs,
  e2eFuelPlanToneBlockRange,
  fuelPlanToneSpecFileBasenames,
  isFuelPlanToneCoverageComplete,
  isFuelPlanToneAriaCoverageComplete,
  isFuelPlanToneCardCoverageComplete,
  isFuelPlanToneExpectedCoverageComplete,
  isFuelPlanToneFullCoverageComplete,
} from './e2eFuelPlanToneCoverage'

describe('e2eFuelPlanToneCoverage', () => {
  it('consolida 3 specs stack tono Fuel×EntrenaPlan (oleada 428)', () => {
    expect(countE2EFuelPlanToneSpecs()).toBe(3)
    expect(e2eFuelPlanToneBlockRange()).toEqual({ from: 421, to: 428 })
    expect(isFuelPlanToneCoverageComplete()).toBe(true)
    expect(isFuelPlanToneExpectedCoverageComplete()).toBe(true)
    expect(isFuelPlanToneAriaCoverageComplete()).toBe(true)
    expect(isFuelPlanToneCardCoverageComplete()).toBe(true)
    expect(isFuelPlanToneFullCoverageComplete()).toBe(true)
  })

  it('fuelPlanToneSpecFileBasenames para CI e2e-smoke (oleada 428)', () => {
    expect(fuelPlanToneSpecFileBasenames()).toEqual([
      'training-mega-flow.spec.ts',
      'workout-plan-history-flow.spec.ts',
      'workout-fuel-flow.spec.ts',
    ])
  })
})