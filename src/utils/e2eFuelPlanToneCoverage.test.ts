import { describe, expect, it } from 'vitest'
import {
  countE2EFuelPlanToneSpecs,
  e2eFuelPlanToneBlockRange,
  fuelPlanToneSpecFileBasenames,
  isFuelPlanToneCoverageComplete,
  isFuelPlanToneAriaCoverageComplete,
  isFuelPlanToneCardCoverageComplete,
  isFuelPlanToneExpectedCoverageComplete,
} from './e2eFuelPlanToneCoverage'

describe('e2eFuelPlanToneCoverage', () => {
  it('consolida 3 specs stack tono Fuel×EntrenaPlan (oleada 427)', () => {
    expect(countE2EFuelPlanToneSpecs()).toBe(3)
    expect(e2eFuelPlanToneBlockRange()).toEqual({ from: 421, to: 427 })
    expect(isFuelPlanToneCoverageComplete()).toBe(true)
    expect(isFuelPlanToneExpectedCoverageComplete()).toBe(true)
    expect(isFuelPlanToneAriaCoverageComplete()).toBe(true)
    expect(isFuelPlanToneCardCoverageComplete()).toBe(true)
  })

  it('fuelPlanToneSpecFileBasenames para CI e2e-smoke (oleada 427)', () => {
    expect(fuelPlanToneSpecFileBasenames()).toEqual([
      'training-mega-flow.spec.ts',
      'workout-plan-history-flow.spec.ts',
      'workout-fuel-flow.spec.ts',
    ])
  })
})