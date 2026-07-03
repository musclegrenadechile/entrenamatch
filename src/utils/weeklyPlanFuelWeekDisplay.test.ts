import { describe, expect, it } from 'vitest'
import {
  buildWeeklyPlanFuelWeekAriaLabel,
  buildWeeklyPlanFuelWeekHint,
  shouldShowWeeklyPlanFuelWeekHint,
  WEEKLY_PLAN_FUEL_WEEK_HINT_CLASS,
} from './weeklyPlanFuelWeekDisplay'
import type { WeeklyEnergySummary } from '../domain/weeklyPlan/types'

const baseEnergy: WeeklyEnergySummary = {
  weekKey: '2026-W27',
  loggedDays: 5,
  totalConsumedKcal: 14000,
  totalBurnKcal: 1200,
  totalTargetKcal: 14000,
  weeklyDeltaKcal: 2200,
  avgDailyDeltaKcal: 440,
}

describe('weeklyPlanFuelWeekDisplay', () => {
  it('WEEKLY_PLAN_FUEL_WEEK_HINT_CLASS', () => {
    expect(WEEKLY_PLAN_FUEL_WEEK_HINT_CLASS).toBe('em-v2-plan__fuel-week-hint')
  })

  it('pide más días Fuel cuando loggedDays < 3', () => {
    const hint = buildWeeklyPlanFuelWeekHint('under_fueled', {
      ...baseEnergy,
      loggedDays: 1,
    })
    expect(hint).toContain('2 días más')
    expect(hint).toContain('Fuel')
  })

  it('hint superávit en escenario surplus', () => {
    const hint = buildWeeklyPlanFuelWeekHint('surplus', {
      ...baseEnergy,
      weeklyDeltaKcal: 450,
    })
    expect(hint).toContain('Superávit')
    expect(hint).toContain('cardio')
  })

  it('hint déficit en escenario deficit', () => {
    const hint = buildWeeklyPlanFuelWeekHint('deficit', {
      ...baseEnergy,
      weeklyDeltaKcal: -320,
    })
    expect(hint).toContain('Déficit')
    expect(hint).toContain('proteína')
  })

  it('aria y visibilidad con perfil Fuel', () => {
    const hint = 'Registra 2 días más en Fuel para afinar EntrenaPlan'
    expect(buildWeeklyPlanFuelWeekAriaLabel(hint)).toContain('Balance Fuel')
    expect(shouldShowWeeklyPlanFuelWeekHint(hint, true)).toBe(true)
    expect(shouldShowWeeklyPlanFuelWeekHint(hint, false)).toBe(false)
    expect(shouldShowWeeklyPlanFuelWeekHint(null, true)).toBe(false)
  })
})