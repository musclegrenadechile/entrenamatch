import { describe, expect, it } from 'vitest'
import {
  buildWeeklyPlanFuelHeadlineChipAriaLabel,
  buildWeeklyPlanFuelHeadlineChipText,
  resolveWeeklyPlanFuelHeadlineChipToneClass,
  shouldShowWeeklyPlanFuelHeadlineChip,
  WEEKLY_PLAN_FUEL_HEADLINE_CHIP_CLASS,
} from './weeklyPlanHeadlineFuelDisplay'
import type { WeeklyEnergySummary } from '../domain/weeklyPlan/types'

const baseEnergy: WeeklyEnergySummary = {
  weekKey: '2026-W27',
  loggedDays: 5,
  totalConsumedKcal: 21000,
  totalBurnKcal: 1200,
  totalTargetKcal: 19600,
  weeklyDeltaKcal: 450,
  avgDailyDeltaKcal: 90,
}

describe('weeklyPlanHeadlineFuelDisplay', () => {
  it('WEEKLY_PLAN_FUEL_HEADLINE_CHIP_CLASS', () => {
    expect(WEEKLY_PLAN_FUEL_HEADLINE_CHIP_CLASS).toBe('em-v2-plan__headline-fuel')
  })

  it('chip por escenario Fuel', () => {
    expect(
      buildWeeklyPlanFuelHeadlineChipText('under_fueled', { ...baseEnergy, loggedDays: 1 })
    ).toBe('Afinar Fuel')
    expect(buildWeeklyPlanFuelHeadlineChipText('surplus', baseEnergy)).toBe('Superávit')
    expect(
      buildWeeklyPlanFuelHeadlineChipText('deficit', { ...baseEnergy, weeklyDeltaKcal: -320 })
    ).toBe('Déficit')
  })

  it('tono y visibilidad', () => {
    expect(resolveWeeklyPlanFuelHeadlineChipToneClass('surplus', baseEnergy)).toBe(
      'em-v2-plan__headline-fuel--surplus'
    )
    expect(buildWeeklyPlanFuelHeadlineChipAriaLabel('Superávit')).toContain('Escenario Fuel')
    expect(shouldShowWeeklyPlanFuelHeadlineChip('surplus', baseEnergy, true)).toBe(true)
    expect(shouldShowWeeklyPlanFuelHeadlineChip('surplus', baseEnergy, false)).toBe(false)
  })
})