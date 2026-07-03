import { describe, expect, it } from 'vitest'
import {
  buildWeeklyPlanFuelWeekChipAriaLabel,
  buildWeeklyPlanFuelWeekChipText,
  resolveWeeklyPlanFuelWeekChipToneClass,
  shouldShowWeeklyPlanFuelWeekChip,
  WEEKLY_PLAN_FUEL_WEEK_CHIP_CLASS,
} from './weeklyPlanFuelWeekChipDisplay'
import type { WeeklyEnergySummary } from '../domain/weeklyPlan/types'

const baseEnergy: WeeklyEnergySummary = {
  weekKey: '2026-W27',
  loggedDays: 5,
  totalConsumedKcal: 21000,
  totalBurnKcal: 1200,
  totalTargetKcal: 19600,
  weeklyDeltaKcal: 2200,
  avgDailyDeltaKcal: 440,
}

describe('weeklyPlanFuelWeekChipDisplay', () => {
  it('WEEKLY_PLAN_FUEL_WEEK_CHIP_CLASS', () => {
    expect(WEEKLY_PLAN_FUEL_WEEK_CHIP_CLASS).toBe('em-v2-plan__fuel-week-chip')
  })

  it('chip surplus con signo +', () => {
    const text = buildWeeklyPlanFuelWeekChipText('surplus', {
      ...baseEnergy,
      weeklyDeltaKcal: 450,
    })
    expect(text).toBe('Δ +450 kcal')
    expect(resolveWeeklyPlanFuelWeekChipToneClass('surplus', {
      ...baseEnergy,
      weeklyDeltaKcal: 450,
    })).toBe('em-v2-plan__fuel-week-chip--surplus')
  })

  it('chip deficit sin signo duplicado', () => {
    const text = buildWeeklyPlanFuelWeekChipText('deficit', {
      ...baseEnergy,
      weeklyDeltaKcal: -320,
    })
    expect(text).toBe('Δ -320 kcal')
    expect(resolveWeeklyPlanFuelWeekChipToneClass('deficit', {
      ...baseEnergy,
      weeklyDeltaKcal: -320,
    })).toBe('em-v2-plan__fuel-week-chip--deficit')
  })

  it('oculto en under-fueled y sin perfil', () => {
    expect(
      buildWeeklyPlanFuelWeekChipText('under_fueled', { ...baseEnergy, loggedDays: 1 })
    ).toBeNull()
    expect(shouldShowWeeklyPlanFuelWeekChip('surplus', baseEnergy, false)).toBe(false)
    expect(buildWeeklyPlanFuelWeekChipAriaLabel('Δ +450 kcal')).toContain('Balance semanal')
  })
})