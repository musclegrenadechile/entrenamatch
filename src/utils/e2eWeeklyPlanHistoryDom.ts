import { WEEKLY_PLAN_HISTORY_HINT_CLASS } from './weeklyPlanHistoryDisplay'
import { WEEKLY_PLAN_ROTATION_CHIP_CLASS } from './weeklyPlanRotationDisplay'

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

export function isWeeklyPlanCardVisible(): boolean {
  return findEntrenaPlanCard() !== null
}