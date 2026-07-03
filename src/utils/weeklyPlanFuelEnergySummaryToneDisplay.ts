import type { WeeklyEnergySummary } from '../domain/weeklyPlan/types'
import { FUEL_TONE_ARIA_LABEL } from './weeklyPlanFuelToneStackAriaDisplay'
import type { FuelWeekHintTone } from './weeklyPlanFuelWeekToneDisplay'

export const WEEKLY_PLAN_ENERGY_SUMMARY_CLASS = 'em-v2-plan__energy-summary'

export const ENERGY_SUMMARY_FUEL_TONE_CLASS: Record<FuelWeekHintTone, string> = {
  'under-fueled': `${WEEKLY_PLAN_ENERGY_SUMMARY_CLASS}--under-fueled`,
  surplus: `${WEEKLY_PLAN_ENERGY_SUMMARY_CLASS}--surplus`,
  deficit: `${WEEKLY_PLAN_ENERGY_SUMMARY_CLASS}--deficit`,
}

export function resolveWeeklyPlanEnergySummaryFuelToneClass(
  tone: FuelWeekHintTone | null
): string | null {
  if (!tone) return null
  return ENERGY_SUMMARY_FUEL_TONE_CLASS[tone]
}

export function buildWeeklyPlanEnergySummaryText(energy: WeeklyEnergySummary): string {
  return `Semana: ${energy.totalConsumedKcal} kcal consumidas · ~${energy.totalBurnKcal} quemadas`
}

export function shouldShowWeeklyPlanEnergySummary(energy: WeeklyEnergySummary): boolean {
  return energy.loggedDays > 0
}

/** aria-label del footer energía semanal con tono Fuel (oleada 433). */
export function buildWeeklyPlanEnergySummaryFuelToneAriaLabel(
  energy: WeeklyEnergySummary,
  tone: FuelWeekHintTone
): string {
  return `Balance energético semanal (${FUEL_TONE_ARIA_LABEL[tone]}): ${buildWeeklyPlanEnergySummaryText(energy)}`
}

export function energySummaryFuelAriaMatchesTone(
  ariaLabel: string | null,
  tone: FuelWeekHintTone
): boolean {
  if (!ariaLabel) return false
  return ariaLabel.includes(`(${FUEL_TONE_ARIA_LABEL[tone]})`)
}