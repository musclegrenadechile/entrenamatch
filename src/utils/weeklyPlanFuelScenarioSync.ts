import type { PlanScenario } from '../domain/weeklyPlan/types'
import { resolveWeeklyPlanScenarioClass } from '../components/plan/weeklyPlanCardDisplay'
import type { FuelWeekHintTone } from './weeklyPlanFuelWeekToneDisplay'

export const FUEL_TONE_SCENARIO_BORDER_CLASS: Record<FuelWeekHintTone, string> = {
  'under-fueled': 'em-v2-plan--under-fueled',
  surplus: 'em-v2-plan--surplus',
  deficit: 'em-v2-plan--deficit',
}

/** Borde de card alineado al tono Fuel semanal (oleada 421). */
export function resolveWeeklyPlanFuelScenarioBorderClass(
  tone: FuelWeekHintTone
): string {
  return FUEL_TONE_SCENARIO_BORDER_CLASS[tone]
}

export function resolveWeeklyPlanScenarioBorderForPlan(
  scenario: PlanScenario
): string {
  return resolveWeeklyPlanScenarioClass(scenario)
}

export function fuelToneMatchesScenarioBorder(
  tone: FuelWeekHintTone,
  borderClass: string | null
): boolean {
  return borderClass === resolveWeeklyPlanFuelScenarioBorderClass(tone)
}

export function planScenarioMatchesBorder(
  scenario: PlanScenario,
  borderClass: string | null
): boolean {
  return borderClass === resolveWeeklyPlanScenarioBorderForPlan(scenario)
}