import { describe, expect, it } from 'vitest'
import {
  buildWeeklyPlanFuelHeadlineToneAriaLabel,
  buildWeeklyPlanFuelRowToneAriaLabel,
  buildWeeklyPlanFuelWeekToneAriaLabel,
  buildWeeklyPlanNutritionToneAriaLabel,
  fuelToneAriaMatchesExpected,
  FUEL_TONE_ARIA_LABEL,
  isWeeklyPlanFuelToneAriaStackAligned,
} from './weeklyPlanFuelToneStackAriaDisplay'

describe('weeklyPlanFuelToneStackAriaDisplay', () => {
  it('FUEL_TONE_ARIA_LABEL trilogía', () => {
    expect(FUEL_TONE_ARIA_LABEL['under-fueled']).toBe('Afinar Fuel')
    expect(FUEL_TONE_ARIA_LABEL.surplus).toBe('Superávit')
    expect(FUEL_TONE_ARIA_LABEL.deficit).toBe('Déficit')
  })

  it('builders incluyen tono entre paréntesis', () => {
    expect(buildWeeklyPlanFuelWeekToneAriaLabel('Hint', 'surplus')).toContain('(Superávit)')
    expect(buildWeeklyPlanFuelHeadlineToneAriaLabel('Superávit', 'surplus')).toContain(
      '(Superávit)'
    )
    expect(buildWeeklyPlanNutritionToneAriaLabel('Nota', 'deficit')).toContain('(Déficit)')
    expect(buildWeeklyPlanFuelRowToneAriaLabel('surplus', 'Δ +450 kcal')).toContain(
      '(Superávit)'
    )
  })

  it('isWeeklyPlanFuelToneAriaStackAligned', () => {
    const aligned = {
      hint: buildWeeklyPlanFuelWeekToneAriaLabel('H', 'surplus'),
      headline: buildWeeklyPlanFuelHeadlineToneAriaLabel('Superávit', 'surplus'),
      nutrition: buildWeeklyPlanNutritionToneAriaLabel('N', 'surplus'),
      chip: null,
      row: buildWeeklyPlanFuelRowToneAriaLabel('surplus'),
    }
    expect(isWeeklyPlanFuelToneAriaStackAligned(aligned, 'surplus')).toBe(true)
    expect(fuelToneAriaMatchesExpected(aligned.hint, 'surplus')).toBe(true)
    expect(fuelToneAriaMatchesExpected(aligned.hint, 'deficit')).toBe(false)
  })
})