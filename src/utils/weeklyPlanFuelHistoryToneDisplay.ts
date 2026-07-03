import { FUEL_TONE_ARIA_LABEL } from './weeklyPlanFuelToneStackAriaDisplay'
import type { FuelWeekHintTone } from './weeklyPlanFuelWeekToneDisplay'
import { WEEKLY_PLAN_HISTORY_HINT_CLASS } from './weeklyPlanHistoryDisplay'

export const HISTORY_FUEL_TONE_CLASS: Record<FuelWeekHintTone, string> = {
  'under-fueled': `${WEEKLY_PLAN_HISTORY_HINT_CLASS}--under-fueled`,
  surplus: `${WEEKLY_PLAN_HISTORY_HINT_CLASS}--surplus`,
  deficit: `${WEEKLY_PLAN_HISTORY_HINT_CLASS}--deficit`,
}

export function resolveWeeklyPlanHistoryFuelToneClass(
  tone: FuelWeekHintTone | null
): string | null {
  if (!tone) return null
  return HISTORY_FUEL_TONE_CLASS[tone]
}

/** aria-label del hint PR con tono Fuel cuando ambos visibles (oleada 430). */
export function buildWeeklyPlanHistoryFuelToneAriaLabel(
  hint: string,
  tone: FuelWeekHintTone
): string {
  const stripped = hint.replace(/^🏆\s*/, '')
  return `Progreso reciente (${FUEL_TONE_ARIA_LABEL[tone]}): ${stripped}`
}

export function historyFuelAriaMatchesTone(
  ariaLabel: string | null,
  tone: FuelWeekHintTone
): boolean {
  if (!ariaLabel) return false
  return ariaLabel.includes(`(${FUEL_TONE_ARIA_LABEL[tone]})`)
}