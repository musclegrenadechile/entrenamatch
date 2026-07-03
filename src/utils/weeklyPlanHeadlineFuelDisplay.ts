import type { PlanScenario, WeeklyEnergySummary } from '../domain/weeklyPlan/types'
import {
  resolveWeeklyPlanFuelWeekHintTone,
  type FuelWeekHintTone,
} from './weeklyPlanFuelWeekToneDisplay'

export const WEEKLY_PLAN_FUEL_HEADLINE_CHIP_CLASS = 'em-v2-plan__headline-fuel'

const HEADLINE_CHIP_TONE_CLASS: Record<FuelWeekHintTone, string> = {
  'under-fueled': 'em-v2-plan__headline-fuel--under-fueled',
  surplus: 'em-v2-plan__headline-fuel--surplus',
  deficit: 'em-v2-plan__headline-fuel--deficit',
}

/** Chip compacto de escenario Fuel junto al headline (oleada 418). */
export function buildWeeklyPlanFuelHeadlineChipText(
  scenario: PlanScenario,
  energy: WeeklyEnergySummary
): string | null {
  const tone = resolveWeeklyPlanFuelWeekHintTone(scenario, energy)
  switch (tone) {
    case 'under-fueled':
      return 'Afinar Fuel'
    case 'surplus':
      return 'Superávit'
    case 'deficit':
      return 'Déficit'
    default:
      return null
  }
}

export function buildWeeklyPlanFuelHeadlineChipAriaLabel(text: string): string {
  return `Escenario Fuel: ${text}`
}

export function resolveWeeklyPlanFuelHeadlineChipToneClass(
  scenario: PlanScenario,
  energy: WeeklyEnergySummary
): string | null {
  const tone = resolveWeeklyPlanFuelWeekHintTone(scenario, energy)
  if (!tone) return null
  return HEADLINE_CHIP_TONE_CLASS[tone]
}

export function shouldShowWeeklyPlanFuelHeadlineChip(
  scenario: PlanScenario,
  energy: WeeklyEnergySummary,
  hasFuelProfile: boolean
): boolean {
  return hasFuelProfile && !!buildWeeklyPlanFuelHeadlineChipText(scenario, energy)
}