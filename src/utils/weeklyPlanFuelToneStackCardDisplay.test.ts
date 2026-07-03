import { describe, expect, it } from 'vitest'
import {
  buildWeeklyPlanFuelCardAriaLabel,
  fuelCardAriaMatchesTone,
  WEEKLY_PLAN_FUEL_CARD_ARIA_BASE,
} from './weeklyPlanFuelToneStackCardDisplay'

describe('weeklyPlanFuelToneStackCardDisplay', () => {
  it('buildWeeklyPlanFuelCardAriaLabel trilogía', () => {
    expect(buildWeeklyPlanFuelCardAriaLabel('under-fueled')).toBe(
      `${WEEKLY_PLAN_FUEL_CARD_ARIA_BASE} (Afinar Fuel)`
    )
    expect(buildWeeklyPlanFuelCardAriaLabel('surplus')).toContain('Superávit')
    expect(buildWeeklyPlanFuelCardAriaLabel('deficit')).toContain('Déficit')
  })

  it('fuelCardAriaMatchesTone', () => {
    const aria = buildWeeklyPlanFuelCardAriaLabel('surplus')
    expect(fuelCardAriaMatchesTone(aria, 'surplus')).toBe(true)
    expect(fuelCardAriaMatchesTone(aria, 'deficit')).toBe(false)
    expect(fuelCardAriaMatchesTone(null, 'surplus')).toBe(false)
  })
})