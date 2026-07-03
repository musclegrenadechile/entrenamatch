import type { PlanScenario, WeeklyEnergySummary } from '../domain/weeklyPlan/types'
import { resolveWeeklyPlanFuelWeekHintTone } from './weeklyPlanFuelWeekToneDisplay'

export const WEEKLY_PLAN_NUTRITION_CLASS = 'em-v2-plan__nutrition'

/** Sufijo nutricional según tono Fuel×plan (oleada 415). */
export function buildWeeklyPlanNutritionFuelSuffix(
  scenario: PlanScenario,
  energy: WeeklyEnergySummary
): string | null {
  const tone = resolveWeeklyPlanFuelWeekHintTone(scenario, energy)
  switch (tone) {
    case 'under-fueled':
      return 'Registra Fuel para afinar macros.'
    case 'surplus':
      return 'Compensa con cena ligera y proteína magra.'
    case 'deficit':
      return 'Sube proteína en la próxima comida.'
    default:
      return null
  }
}

export function mergeWeeklyPlanNutritionNote(
  base: string | undefined,
  suffix: string | null
): string | null {
  const trimmedBase = base?.trim()
  const trimmedSuffix = suffix?.trim()
  if (!trimmedBase && !trimmedSuffix) return null
  if (!trimmedBase) return trimmedSuffix!
  if (!trimmedSuffix) return trimmedBase
  if (trimmedBase.includes(trimmedSuffix)) return trimmedBase
  return `${trimmedBase} · ${trimmedSuffix}`
}

export function shouldShowWeeklyPlanNutritionNote(
  text: string | null,
  hasFuelProfile: boolean
): boolean {
  return !!text?.trim() && hasFuelProfile
}