import { WEEKLY_PLAN_HISTORY_HINT_CLASS } from './weeklyPlanHistoryDisplay'
import { WEEKLY_PLAN_ROTATION_CHIP_CLASS } from './weeklyPlanRotationDisplay'
import { WEEKLY_PLAN_FUEL_WEEK_CHIP_CLASS } from './weeklyPlanFuelWeekChipDisplay'
import { WEEKLY_PLAN_FUEL_HEADLINE_CHIP_CLASS } from './weeklyPlanHeadlineFuelDisplay'
import { WEEKLY_PLAN_FUEL_ROW_CLASS } from './weeklyPlanFuelRowToneDisplay'
import { WEEKLY_PLAN_FUEL_WEEK_HINT_CLASS } from './weeklyPlanFuelWeekDisplay'
import { WEEKLY_PLAN_NUTRITION_CLASS } from './weeklyPlanNutritionDisplay'

function findEntrenaPlanCard(): HTMLElement | null {
  const plans = document.querySelectorAll('.em-v2-plan')
  for (const plan of plans) {
    if (plan.textContent?.includes('EntrenaPlan')) {
      return plan as HTMLElement
    }
  }
  return null
}

export function readWeeklyPlanHistoryHint(): string | null {
  const card = findEntrenaPlanCard()
  const hint = card?.querySelector(`.${WEEKLY_PLAN_HISTORY_HINT_CLASS}`)
  return hint?.textContent?.trim() ?? null
}

/** Texto de detalle del plan (sin hint PR). */
export function readWeeklyPlanDetail(): string | null {
  const card = findEntrenaPlanCard()
  if (!card) return null
  const details = card.querySelectorAll('.em-v2-card__detail')
  for (const el of details) {
    if (el.closest(`.${WEEKLY_PLAN_HISTORY_HINT_CLASS}`)) continue
    const text = el.textContent?.trim()
    if (text) return text
  }
  return null
}

export function readWeeklyPlanRotationChip(): string | null {
  const card = findEntrenaPlanCard()
  const chip = card?.querySelector(`.${WEEKLY_PLAN_ROTATION_CHIP_CLASS}`)
  return chip?.textContent?.trim() ?? null
}

export function readWeeklyPlanRotationAriaLabel(): string | null {
  const card = findEntrenaPlanCard()
  const chip = card?.querySelector(`.${WEEKLY_PLAN_ROTATION_CHIP_CLASS}`)
  return chip?.getAttribute('aria-label')?.trim() ?? null
}

export function readWeeklyPlanFuelWeekHint(): string | null {
  const card = findEntrenaPlanCard()
  const hint = card?.querySelector(`.${WEEKLY_PLAN_FUEL_WEEK_HINT_CLASS}`)
  return hint?.textContent?.trim() ?? null
}

export function readWeeklyPlanFuelWeekAriaLabel(): string | null {
  const card = findEntrenaPlanCard()
  const hint = card?.querySelector(`.${WEEKLY_PLAN_FUEL_WEEK_HINT_CLASS}`)
  return hint?.getAttribute('aria-label')?.trim() ?? null
}

export function readWeeklyPlanFuelWeekChip(): string | null {
  const card = findEntrenaPlanCard()
  const chip = card?.querySelector(`.${WEEKLY_PLAN_FUEL_WEEK_CHIP_CLASS}`)
  return chip?.textContent?.trim() ?? null
}

export function readWeeklyPlanFuelHeadlineChip(): string | null {
  const card = findEntrenaPlanCard()
  const chip = card?.querySelector(`.${WEEKLY_PLAN_FUEL_HEADLINE_CHIP_CLASS}`)
  return chip?.textContent?.trim() ?? null
}

export function readWeeklyPlanFuelHeadlineChipAriaLabel(): string | null {
  const card = findEntrenaPlanCard()
  const chip = card?.querySelector(`.${WEEKLY_PLAN_FUEL_HEADLINE_CHIP_CLASS}`)
  return chip?.getAttribute('aria-label')?.trim() ?? null
}

export function readWeeklyPlanFuelHeadlineChipToneClass(): string | null {
  const card = findEntrenaPlanCard()
  const chip = card?.querySelector(`.${WEEKLY_PLAN_FUEL_HEADLINE_CHIP_CLASS}`)
  if (!chip) return null
  for (const cls of chip.classList) {
    if (cls.startsWith(`${WEEKLY_PLAN_FUEL_HEADLINE_CHIP_CLASS}--`)) return cls
  }
  return null
}

export function readWeeklyPlanFuelWeekToneClass(): string | null {
  const card = findEntrenaPlanCard()
  const hint = card?.querySelector(`.${WEEKLY_PLAN_FUEL_WEEK_HINT_CLASS}`)
  if (!hint) return null
  for (const cls of hint.classList) {
    if (cls.startsWith(`${WEEKLY_PLAN_FUEL_WEEK_HINT_CLASS}--`)) return cls
  }
  return null
}

export function readWeeklyPlanNutritionNote(): string | null {
  const card = findEntrenaPlanCard()
  const note = card?.querySelector(`.${WEEKLY_PLAN_NUTRITION_CLASS}`)
  const text = note?.textContent?.trim()
  return text?.replace(/^🍽\s*/, '') ?? null
}

export function readWeeklyPlanNutritionAriaLabel(): string | null {
  const card = findEntrenaPlanCard()
  const note = card?.querySelector(`.${WEEKLY_PLAN_NUTRITION_CLASS}`)
  return note?.getAttribute('aria-label')?.trim() ?? null
}

export function readWeeklyPlanFuelRowToneClass(): string | null {
  const card = findEntrenaPlanCard()
  const row = card?.querySelector(`.${WEEKLY_PLAN_FUEL_ROW_CLASS}`)
  if (!row) return null
  for (const cls of row.classList) {
    if (cls.startsWith(`${WEEKLY_PLAN_FUEL_ROW_CLASS}--`)) return cls
  }
  return null
}

export function readWeeklyPlanScenarioClass(): string | null {
  const card = findEntrenaPlanCard()
  if (!card) return null
  for (const cls of card.classList) {
    if (cls.startsWith('em-v2-plan--')) return cls
  }
  return null
}

export function isWeeklyPlanCardVisible(): boolean {
  return findEntrenaPlanCard() !== null
}