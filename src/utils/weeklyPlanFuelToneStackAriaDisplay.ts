import type { FuelWeekHintTone } from './weeklyPlanFuelWeekToneDisplay'

export const FUEL_TONE_ARIA_LABEL: Record<FuelWeekHintTone, string> = {
  'under-fueled': 'Afinar Fuel',
  surplus: 'Superávit',
  deficit: 'Déficit',
}

/** aria-label del hint semanal con tono Fuel (oleada 426). */
export function buildWeeklyPlanFuelWeekToneAriaLabel(
  hint: string,
  tone: FuelWeekHintTone
): string {
  return `Balance Fuel semanal (${FUEL_TONE_ARIA_LABEL[tone]}): ${hint}`
}

export function buildWeeklyPlanFuelHeadlineToneAriaLabel(
  text: string,
  tone: FuelWeekHintTone
): string {
  return `Escenario Fuel (${FUEL_TONE_ARIA_LABEL[tone]}): ${text}`
}

export function buildWeeklyPlanNutritionToneAriaLabel(
  text: string,
  tone: FuelWeekHintTone
): string {
  return `Nutrición EntrenaPlan (${FUEL_TONE_ARIA_LABEL[tone]}): ${text}`
}

export function buildWeeklyPlanFuelWeekChipToneAriaLabel(
  text: string,
  tone: FuelWeekHintTone
): string {
  return `Balance semanal Fuel (${FUEL_TONE_ARIA_LABEL[tone]}): ${text}`
}

export function buildWeeklyPlanFuelRowToneAriaLabel(
  tone: FuelWeekHintTone,
  deltaText?: string | null
): string {
  const delta = deltaText?.trim() ? ` ${deltaText.trim()}` : ''
  return `Fuel × entreno (${FUEL_TONE_ARIA_LABEL[tone]}):${delta}`
}

export function fuelToneAriaMatchesExpected(
  ariaLabel: string | null,
  tone: FuelWeekHintTone
): boolean {
  if (!ariaLabel) return false
  return ariaLabel.includes(`(${FUEL_TONE_ARIA_LABEL[tone]})`)
}

export function isWeeklyPlanFuelToneAriaStackAligned(
  aria: {
    hint: string | null
    headline: string | null
    nutrition: string | null
    chip: string | null
    row: string | null
  },
  tone: FuelWeekHintTone
): boolean {
  const checks = [aria.hint, aria.headline, aria.nutrition]
  if (aria.chip) checks.push(aria.chip)
  if (aria.row) checks.push(aria.row)
  return checks.every((label) => fuelToneAriaMatchesExpected(label, tone))
}