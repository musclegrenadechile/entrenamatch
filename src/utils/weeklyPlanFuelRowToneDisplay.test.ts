import { describe, expect, it } from 'vitest'
import {
  resolveWeeklyPlanFuelRowToneClass,
  shouldApplyWeeklyPlanFuelRowTone,
  WEEKLY_PLAN_FUEL_ROW_CLASS,
} from './weeklyPlanFuelRowToneDisplay'
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

describe('weeklyPlanFuelRowToneDisplay', () => {
  it('WEEKLY_PLAN_FUEL_ROW_CLASS', () => {
    expect(WEEKLY_PLAN_FUEL_ROW_CLASS).toBe('em-v2-plan__fuel-row')
  })

  it('tono fila Fuel por escenario', () => {
    expect(
      resolveWeeklyPlanFuelRowToneClass('under_fueled', { ...baseEnergy, loggedDays: 1 })
    ).toBe('em-v2-plan__fuel-row--under-fueled')
    expect(resolveWeeklyPlanFuelRowToneClass('surplus', baseEnergy)).toBe(
      'em-v2-plan__fuel-row--surplus'
    )
    expect(
      resolveWeeklyPlanFuelRowToneClass('deficit', { ...baseEnergy, weeklyDeltaKcal: -320 })
    ).toBe('em-v2-plan__fuel-row--deficit')
  })

  it('shouldApplyWeeklyPlanFuelRowTone', () => {
    expect(shouldApplyWeeklyPlanFuelRowTone('surplus', baseEnergy, true)).toBe(true)
    expect(shouldApplyWeeklyPlanFuelRowTone('surplus', baseEnergy, false)).toBe(false)
  })
})