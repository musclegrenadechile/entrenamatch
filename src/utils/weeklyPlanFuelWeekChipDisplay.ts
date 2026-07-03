import type { PlanScenario, WeeklyEnergySummary } from '../domain/weeklyPlan/types'
import {
  resolveWeeklyPlanFuelWeekHintTone,
  type FuelWeekHintTone,
} from './weeklyPlanFuelWeekToneDisplay'

export const WEEKLY_PLAN_FUEL_WEEK_CHIP_CLASS = 'em-v2-plan__fuel-week-chip'

const CHIP_TONE_CLASS: Record<Extract<FuelWeekHintTone, 'surplus' | 'deficit'>, string> = {
  surplus: 'em-v2-plan__fuel-week-chip--surplus',
  deficit: 'em-v2-plan__fuel-week-chip--deficit',
}

/** Chip compacto Δ kcal semanal en superávit/déficit (oleada 413). */
export function buildWeeklyPlanFuelWeekChipText(
  scenario: PlanScenario,
  energy: WeeklyEnergySummary
): string | null {
  const tone = resolveWeeklyPlanFuelWeekHintTone(scenario, energy)
  if (tone !== 'surplus' && tone !== 'deficit') return null
  const sign = energy.weeklyDeltaKcal > 0 ? '+' : ''
  return `Δ ${sign}${energy.weeklyDeltaKcal} kcal`
}

export function buildWeeklyPlanFuelWeekChipAriaLabel(text: string): string {
  return `Balance semanal Fuel: ${text}`
}

export function resolveWeeklyPlanFuelWeekChipToneClass(
  scenario: PlanScenario,
  energy: WeeklyEnergySummary
): string | null {
  const tone = resolveWeeklyPlanFuelWeekHintTone(scenario, energy)
  if (tone === 'surplus' || tone === 'deficit') return CHIP_TONE_CLASS[tone]
  return null
}

export function shouldShowWeeklyPlanFuelWeekChip(
  scenario: PlanScenario,
  energy: WeeklyEnergySummary,
  hasFuelProfile: boolean
): boolean {
  return hasFuelProfile && !!buildWeeklyPlanFuelWeekChipText(scenario, energy)
}