import type { PlanScenario, WeeklyEnergySummary } from '../domain/weeklyPlan/types'
import { buildWeeklyPlanFuelWeekHint } from './weeklyPlanFuelWeekDisplay'

export type FuelWeekHintTone = 'under-fueled' | 'surplus' | 'deficit'

export const FUEL_WEEK_HINT_TONE_CLASS: Record<FuelWeekHintTone, string> = {
  'under-fueled': 'em-v2-plan__fuel-week-hint--under-fueled',
  surplus: 'em-v2-plan__fuel-week-hint--surplus',
  deficit: 'em-v2-plan__fuel-week-hint--deficit',
}

const MIN_LOGGED_DAYS_FOR_PLAN = 3

/** Tono visual del hint Fuel×plan según escenario y balance (oleada 412). */
export function resolveWeeklyPlanFuelWeekHintTone(
  scenario: PlanScenario,
  energy: WeeklyEnergySummary
): FuelWeekHintTone | null {
  if (!buildWeeklyPlanFuelWeekHint(scenario, energy)) return null

  if (energy.loggedDays < MIN_LOGGED_DAYS_FOR_PLAN) return 'under-fueled'
  if (scenario === 'surplus' && energy.weeklyDeltaKcal > 300) return 'surplus'
  if (scenario === 'deficit' && energy.weeklyDeltaKcal < -250) return 'deficit'
  return null
}

export function resolveWeeklyPlanFuelWeekHintToneClass(
  tone: FuelWeekHintTone | null
): string | null {
  if (!tone) return null
  return FUEL_WEEK_HINT_TONE_CLASS[tone]
}