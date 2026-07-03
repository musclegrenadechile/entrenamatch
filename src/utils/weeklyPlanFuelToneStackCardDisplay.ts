import { FUEL_TONE_ARIA_LABEL } from './weeklyPlanFuelToneStackAriaDisplay'
import type { FuelWeekHintTone } from './weeklyPlanFuelWeekToneDisplay'

export const WEEKLY_PLAN_FUEL_CARD_ARIA_BASE = 'Plan de entreno recomendado'

/** aria-label de card EntrenaPlan con tono Fuel (oleada 427). */
export function buildWeeklyPlanFuelCardAriaLabel(tone: FuelWeekHintTone): string {
  return `${WEEKLY_PLAN_FUEL_CARD_ARIA_BASE} (${FUEL_TONE_ARIA_LABEL[tone]})`
}

export function fuelCardAriaMatchesTone(
  ariaLabel: string | null,
  tone: FuelWeekHintTone
): boolean {
  if (!ariaLabel) return false
  return ariaLabel.includes(`(${FUEL_TONE_ARIA_LABEL[tone]})`)
}