import { WEEKLY_PLAN_HISTORY_HINT_CLASS } from './weeklyPlanHistoryDisplay'

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

export function isWeeklyPlanCardVisible(): boolean {
  return findEntrenaPlanCard() !== null
}