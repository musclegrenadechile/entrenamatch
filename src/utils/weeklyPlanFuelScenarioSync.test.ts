import { describe, expect, it } from 'vitest'
import {
  fuelToneMatchesScenarioBorder,
  FUEL_TONE_SCENARIO_BORDER_CLASS,
  planScenarioMatchesBorder,
  resolveWeeklyPlanFuelScenarioBorderClass,
  resolveWeeklyPlanScenarioBorderForPlan,
} from './weeklyPlanFuelScenarioSync'

describe('weeklyPlanFuelScenarioSync', () => {
  it('FUEL_TONE_SCENARIO_BORDER_CLASS', () => {
    expect(FUEL_TONE_SCENARIO_BORDER_CLASS.surplus).toBe('em-v2-plan--surplus')
    expect(FUEL_TONE_SCENARIO_BORDER_CLASS.deficit).toBe('em-v2-plan--deficit')
  })

  it('tono Fuel ↔ borde card', () => {
    expect(resolveWeeklyPlanFuelScenarioBorderClass('under-fueled')).toBe(
      'em-v2-plan--under-fueled'
    )
    expect(fuelToneMatchesScenarioBorder('surplus', 'em-v2-plan--surplus')).toBe(true)
    expect(fuelToneMatchesScenarioBorder('deficit', 'em-v2-plan--on-track')).toBe(false)
  })

  it('escenario plan ↔ borde card', () => {
    expect(resolveWeeklyPlanScenarioBorderForPlan('under_fueled')).toBe(
      'em-v2-plan--under-fueled'
    )
    expect(planScenarioMatchesBorder('surplus', 'em-v2-plan--surplus')).toBe(true)
    expect(planScenarioMatchesBorder('deficit', 'em-v2-plan--deficit')).toBe(true)
  })
})