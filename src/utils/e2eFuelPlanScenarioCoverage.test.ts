import { describe, expect, it } from 'vitest'
import {
  countE2EFuelPlanScenarioSpecs,
  e2eFuelPlanScenarioBlockRange,
  fuelPlanScenarioSpecFileBasenames,
  isFuelPlanScenarioCoverageComplete,
} from './e2eFuelPlanScenarioCoverage'

describe('e2eFuelPlanScenarioCoverage', () => {
  it('consolida 3 specs borde escenario Fuel×EntrenaPlan (oleada 421)', () => {
    expect(countE2EFuelPlanScenarioSpecs()).toBe(3)
    expect(e2eFuelPlanScenarioBlockRange()).toEqual({ from: 421, to: 421 })
    expect(isFuelPlanScenarioCoverageComplete()).toBe(true)
  })

  it('fuelPlanScenarioSpecFileBasenames para CI e2e-smoke (oleada 421)', () => {
    expect(fuelPlanScenarioSpecFileBasenames()).toEqual([
      'training-mega-flow.spec.ts',
      'workout-plan-history-flow.spec.ts',
      'workout-fuel-flow.spec.ts',
    ])
  })
})