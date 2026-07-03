import type { PlanScenario, WeeklyEnergySummary } from '../domain/weeklyPlan/types'

export const WEEKLY_PLAN_FUEL_WEEK_HINT_CLASS = 'em-v2-plan__fuel-week-hint'

const MIN_LOGGED_DAYS_FOR_PLAN = 3

/** Hint semanal Fuel×EntrenaPlan según balance y escenario (oleada 411). */
export function buildWeeklyPlanFuelWeekHint(
  scenario: PlanScenario,
  energy: WeeklyEnergySummary
): string | null {
  const { loggedDays, weeklyDeltaKcal } = energy

  if (loggedDays < MIN_LOGGED_DAYS_FOR_PLAN) {
    const remaining = MIN_LOGGED_DAYS_FOR_PLAN - loggedDays
    return `Registra ${remaining} día${remaining > 1 ? 's' : ''} más en Fuel para afinar EntrenaPlan`
  }

  if (scenario === 'surplus' && weeklyDeltaKcal > 300) {
    return `Superávit semanal +${weeklyDeltaKcal} kcal — prioriza cardio o caminata`
  }

  if (scenario === 'deficit' && weeklyDeltaKcal < -250) {
    return `Déficit semanal ${weeklyDeltaKcal} kcal — prioriza recuperación y proteína`
  }

  return null
}

export function buildWeeklyPlanFuelWeekAriaLabel(hint: string): string {
  return `Balance Fuel semanal: ${hint}`
}

export function shouldShowWeeklyPlanFuelWeekHint(
  hint: string | null,
  hasFuelProfile: boolean
): boolean {
  return !!hint?.trim() && hasFuelProfile
}