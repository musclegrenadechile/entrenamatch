import { describe, expect, it } from 'vitest'
import {
  buildWeeklyPlanEnergySummaryFuelToneAriaLabel,
  buildWeeklyPlanEnergySummaryText,
  ENERGY_SUMMARY_FUEL_TONE_CLASS,
  energySummaryFuelAriaMatchesTone,
  resolveWeeklyPlanEnergySummaryFuelToneClass,
  shouldShowWeeklyPlanEnergySummary,
} from './weeklyPlanFuelEnergySummaryToneDisplay'

const baseEnergy = {
  loggedDays: 5,
  totalConsumedKcal: 14000,
  totalBurnKcal: 3200,
  totalTargetKcal: 10500,
  weeklyDeltaKcal: 300,
  dailyDeltaKcal: 60,
}

describe('weeklyPlanFuelEnergySummaryToneDisplay', () => {
  it('resolveWeeklyPlanEnergySummaryFuelToneClass trilogía', () => {
    expect(resolveWeeklyPlanEnergySummaryFuelToneClass('deficit')).toBe(
      ENERGY_SUMMARY_FUEL_TONE_CLASS.deficit
    )
    expect(resolveWeeklyPlanEnergySummaryFuelToneClass('surplus')).toContain('surplus')
    expect(resolveWeeklyPlanEnergySummaryFuelToneClass(null)).toBeNull()
  })

  it('buildWeeklyPlanEnergySummaryText y shouldShow', () => {
    expect(buildWeeklyPlanEnergySummaryText(baseEnergy)).toMatch(/14000 kcal consumidas/)
    expect(shouldShowWeeklyPlanEnergySummary(baseEnergy)).toBe(true)
    expect(shouldShowWeeklyPlanEnergySummary({ ...baseEnergy, loggedDays: 0 })).toBe(false)
  })

  it('buildWeeklyPlanEnergySummaryFuelToneAriaLabel y energySummaryFuelAriaMatchesTone', () => {
    const aria = buildWeeklyPlanEnergySummaryFuelToneAriaLabel(baseEnergy, 'under-fueled')
    expect(aria).toMatch(/Balance energético semanal \(Afinar Fuel\)/)
    expect(aria).toMatch(/14000 kcal consumidas/)
    expect(energySummaryFuelAriaMatchesTone(aria, 'under-fueled')).toBe(true)
    expect(energySummaryFuelAriaMatchesTone(aria, 'surplus')).toBe(false)
  })
})