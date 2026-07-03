import { describe, expect, it } from 'vitest'
import {
  resolveWeeklyPlanNutritionToneClass,
  shouldApplyWeeklyPlanNutritionTone,
} from './weeklyPlanNutritionToneDisplay'
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

describe('weeklyPlanNutritionToneDisplay', () => {
  it('resolveWeeklyPlanNutritionToneClass por escenario', () => {
    expect(
      resolveWeeklyPlanNutritionToneClass('under_fueled', { ...baseEnergy, loggedDays: 1 })
    ).toBe('em-v2-plan__nutrition--under-fueled')
    expect(resolveWeeklyPlanNutritionToneClass('surplus', baseEnergy)).toBe(
      'em-v2-plan__nutrition--surplus'
    )
    expect(
      resolveWeeklyPlanNutritionToneClass('deficit', { ...baseEnergy, weeklyDeltaKcal: -320 })
    ).toBe('em-v2-plan__nutrition--deficit')
  })

  it('shouldApplyWeeklyPlanNutritionTone requiere perfil y texto', () => {
    expect(
      shouldApplyWeeklyPlanNutritionTone('surplus', baseEnergy, true, true)
    ).toBe(true)
    expect(
      shouldApplyWeeklyPlanNutritionTone('surplus', baseEnergy, false, true)
    ).toBe(false)
    expect(
      shouldApplyWeeklyPlanNutritionTone('surplus', baseEnergy, true, false)
    ).toBe(false)
  })
})