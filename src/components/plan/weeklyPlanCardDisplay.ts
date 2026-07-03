import type { WeeklyPlanResult } from '../../domain/weeklyPlan'

export const WEEKLY_PLAN_SCENARIO_CLASS: Record<string, string> = {
  surplus: 'em-v2-plan--surplus',
  deficit: 'em-v2-plan--deficit',
  catch_up: 'em-v2-plan--catch-up',
  rest_needed: 'em-v2-plan--rest',
  under_fueled: 'em-v2-plan--under-fueled',
  on_track: 'em-v2-plan--on-track',
}

export function resolveWeeklyPlanScenarioClass(scenario: WeeklyPlanResult['scenario']): string {
  return WEEKLY_PLAN_SCENARIO_CLASS[scenario] || WEEKLY_PLAN_SCENARIO_CLASS.on_track
}

export function shouldShowWeeklyPlanFuelRow(
  hasFuelProfile: boolean,
  weeklyDeltaKcal?: number | null
): boolean {
  return hasFuelProfile || weeklyDeltaKcal != null
}

export function formatWeeklyPlanDelta(weeklyDeltaKcal: number): string {
  const sign = weeklyDeltaKcal > 0 ? '+' : ''
  return `Δ ${sign}${weeklyDeltaKcal} kcal semana`
}

export function shouldRenderWeeklyPlanEmpty(
  plan: WeeklyPlanResult | null,
  showEmptyState: boolean
): boolean {
  return !plan && showEmptyState
}