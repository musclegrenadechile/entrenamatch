import type { PlanScenario, WeeklyEnergySummary } from '../domain/weeklyPlan/types'
import {
  resolveWeeklyPlanFuelWeekHintTone,
  type FuelWeekHintTone,
} from './weeklyPlanFuelWeekToneDisplay'

export const WEEKLY_PLAN_FUEL_ROW_CLASS = 'em-v2-plan__fuel-row'

const FUEL_ROW_TONE_CLASS: Record<FuelWeekHintTone, string> = {
  'under-fueled': 'em-v2-plan__fuel-row--under-fueled',
  surplus: 'em-v2-plan__fuel-row--surplus',
  deficit: 'em-v2-plan__fuel-row--deficit',
}

/** Tono visual de la fila Fuel×entreno según escenario (oleada 422). */
export function resolveWeeklyPlanFuelRowToneClass(
  scenario: PlanScenario,
  energy: WeeklyEnergySummary
): string | null {
  const tone = resolveWeeklyPlanFuelWeekHintTone(scenario, energy)
  if (!tone) return null
  return FUEL_ROW_TONE_CLASS[tone]
}

export function shouldApplyWeeklyPlanFuelRowTone(
  scenario: PlanScenario,
  energy: WeeklyEnergySummary,
  hasFuelProfile: boolean
): boolean {
  return hasFuelProfile && !!resolveWeeklyPlanFuelRowToneClass(scenario, energy)
}