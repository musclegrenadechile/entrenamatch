import { FUEL_TONE_ARIA_LABEL } from './weeklyPlanFuelToneStackAriaDisplay'
import type { FuelWeekHintTone } from './weeklyPlanFuelWeekToneDisplay'
import { WEEKLY_PLAN_ROTATION_CHIP_CLASS } from './weeklyPlanRotationDisplay'

export const ROTATION_FUEL_TONE_CLASS: Record<FuelWeekHintTone, string> = {
  'under-fueled': `${WEEKLY_PLAN_ROTATION_CHIP_CLASS}--under-fueled`,
  surplus: `${WEEKLY_PLAN_ROTATION_CHIP_CLASS}--surplus`,
  deficit: `${WEEKLY_PLAN_ROTATION_CHIP_CLASS}--deficit`,
}

export function resolveWeeklyPlanRotationFuelToneClass(
  tone: FuelWeekHintTone | null
): string | null {
  if (!tone) return null
  return ROTATION_FUEL_TONE_CLASS[tone]
}

/** aria-label del chip rotación con tono Fuel (oleada 431). */
export function buildWeeklyPlanRotationFuelToneAriaLabel(
  note: string,
  tone: FuelWeekHintTone
): string {
  const muscleMatch = note.match(/Tras PR en\s+([^—]+)/i)
  const typeMatch = note.match(/rotación a\s+(.+?)\.?$/i)
  if (muscleMatch && typeMatch) {
    return `Rotación de plan tras PR en ${muscleMatch[1].trim()} (${FUEL_TONE_ARIA_LABEL[tone]}): siguiente sesión ${typeMatch[1].trim()}`
  }
  const stripped = note.replace(/^Tras PR[^—]*—\s*/i, '').trim()
  return `Rotación de plan (${FUEL_TONE_ARIA_LABEL[tone]}): ${stripped}`
}

export function rotationFuelAriaMatchesTone(
  ariaLabel: string | null,
  tone: FuelWeekHintTone
): boolean {
  if (!ariaLabel) return false
  return ariaLabel.includes(`(${FUEL_TONE_ARIA_LABEL[tone]})`)
}