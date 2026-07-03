import { describe, expect, it } from 'vitest'
import {
  isWeeklyPlanFuelToneStackDemoFullySynced,
  isWeeklyPlanFuelToneStackFullySynced,
} from './weeklyPlanFuelToneStackFullDisplay'
import { buildWeeklyPlanFuelCardAriaLabel } from './weeklyPlanFuelToneStackCardDisplay'
import {
  buildWeeklyPlanFuelHeadlineToneAriaLabel,
  buildWeeklyPlanFuelRowToneAriaLabel,
  buildWeeklyPlanFuelWeekChipToneAriaLabel,
  buildWeeklyPlanFuelWeekToneAriaLabel,
  buildWeeklyPlanNutritionToneAriaLabel,
} from './weeklyPlanFuelToneStackAriaDisplay'
import { buildE2EDemoFuelToneStackExpected } from './weeklyPlanFuelToneStackExpectedDisplay'

describe('weeklyPlanFuelToneStackFullDisplay', () => {
  it('isWeeklyPlanFuelToneStackFullySynced surplus', () => {
    const expected = buildE2EDemoFuelToneStackExpected('surplus')!
    const snapshot = {
      border: expected.border,
      hint: expected.hint,
      headline: expected.headline,
      row: expected.row,
      chip: expected.chip,
      nutrition: expected.nutrition,
    }
    const aria = {
      hint: buildWeeklyPlanFuelWeekToneAriaLabel('Superávit semanal', 'surplus'),
      headline: buildWeeklyPlanFuelHeadlineToneAriaLabel('Superávit', 'surplus'),
      nutrition: buildWeeklyPlanNutritionToneAriaLabel('Cena ligera', 'surplus'),
      chip: buildWeeklyPlanFuelWeekChipToneAriaLabel('+500 kcal', 'surplus'),
      row: buildWeeklyPlanFuelRowToneAriaLabel('surplus', '+500 kcal'),
    }
    const cardAria = buildWeeklyPlanFuelCardAriaLabel('surplus')
    expect(
      isWeeklyPlanFuelToneStackFullySynced('surplus', snapshot, cardAria, aria)
    ).toBe(true)
    expect(
      isWeeklyPlanFuelToneStackDemoFullySynced('surplus', snapshot, cardAria, aria)
    ).toBe(true)
  })

  it('isWeeklyPlanFuelToneStackFullySynced rechaza card aria incorrecta', () => {
    const expected = buildE2EDemoFuelToneStackExpected('deficit')!
    const snapshot = {
      border: expected.border,
      hint: expected.hint,
      headline: expected.headline,
      row: expected.row,
      chip: expected.chip,
      nutrition: expected.nutrition,
    }
    const aria = {
      hint: buildWeeklyPlanFuelWeekToneAriaLabel('Déficit', 'deficit'),
      headline: buildWeeklyPlanFuelHeadlineToneAriaLabel('Déficit', 'deficit'),
      nutrition: buildWeeklyPlanNutritionToneAriaLabel('Proteína', 'deficit'),
      chip: null,
      row: buildWeeklyPlanFuelRowToneAriaLabel('deficit', '-300 kcal'),
    }
    const wrongCard = buildWeeklyPlanFuelCardAriaLabel('surplus')
    expect(
      isWeeklyPlanFuelToneStackFullySynced('deficit', snapshot, wrongCard, aria)
    ).toBe(false)
  })
})