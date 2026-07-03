import { describe, expect, it } from 'vitest'
import {
  buildWeeklyPlanNutritionFuelSuffix,
  mergeWeeklyPlanNutritionNote,
  shouldShowWeeklyPlanNutritionNote,
  WEEKLY_PLAN_NUTRITION_CLASS,
} from './weeklyPlanNutritionDisplay'
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

describe('weeklyPlanNutritionDisplay', () => {
  it('WEEKLY_PLAN_NUTRITION_CLASS', () => {
    expect(WEEKLY_PLAN_NUTRITION_CLASS).toBe('em-v2-plan__nutrition')
  })

  it('sufijo surplus y deficit', () => {
    expect(buildWeeklyPlanNutritionFuelSuffix('surplus', baseEnergy)).toContain('cena ligera')
    expect(
      buildWeeklyPlanNutritionFuelSuffix('deficit', { ...baseEnergy, weeklyDeltaKcal: -320 })
    ).toContain('proteína')
  })

  it('merge base + sufijo sin duplicar', () => {
    const merged = mergeWeeklyPlanNutritionNote(
      'Prioriza carbs + proteína post-entreno.',
      'Sube proteína en la próxima comida.'
    )
    expect(merged).toContain('·')
    expect(merged).toContain('post-entreno')
    expect(
      mergeWeeklyPlanNutritionNote(
        'Prioriza carbs + proteína post-entreno.',
        'Sube proteína en la próxima comida.'
      )
    ).toContain('post-entreno')
  })

  it('visibilidad con perfil Fuel', () => {
    expect(shouldShowWeeklyPlanNutritionNote('Nota', true)).toBe(true)
    expect(shouldShowWeeklyPlanNutritionNote('Nota', false)).toBe(false)
    expect(shouldShowWeeklyPlanNutritionNote(null, true)).toBe(false)
  })
})