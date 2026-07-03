import type { PlanScenario, WeeklyEnergySummary } from '../domain/weeklyPlan/types'
import {
  resolveWeeklyPlanFuelWeekHintTone,
  type FuelWeekHintTone,
} from './weeklyPlanFuelWeekToneDisplay'
import { WEEKLY_PLAN_NUTRITION_CLASS } from './weeklyPlanNutritionDisplay'

const FUEL_NUTRITION_TONE_CLASS: Record<FuelWeekHintTone, string> = {
  'under-fueled': `${WEEKLY_PLAN_NUTRITION_CLASS}--under-fueled`,
  surplus: `${WEEKLY_PLAN_NUTRITION_CLASS}--surplus`,
  deficit: `${WEEKLY_PLAN_NUTRITION_CLASS}--deficit`,
}

/** Tono visual de la nota nutricional según escenario Fuel (oleada 424). */
export function resolveWeeklyPlanNutritionToneClass(
  scenario: PlanScenario,
  energy: WeeklyEnergySummary
): string | null {
  const tone = resolveWeeklyPlanFuelWeekHintTone(scenario, energy)
  if (!tone) return null
  return FUEL_NUTRITION_TONE_CLASS[tone]
}

export function shouldApplyWeeklyPlanNutritionTone(
  scenario: PlanScenario,
  energy: WeeklyEnergySummary,
  hasFuelProfile: boolean,
  hasNutritionText: boolean
): boolean {
  return (
    hasFuelProfile &&
    hasNutritionText &&
    !!resolveWeeklyPlanNutritionToneClass(scenario, energy)
  )
}