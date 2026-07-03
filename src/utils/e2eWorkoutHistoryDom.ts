import { WORKOUT_HISTORY_SUMMARY_CLASS } from './workoutHistoryDisplay'

function findEntrenoDeHoyHistoryCard(): HTMLElement | null {
  const titles = document.querySelectorAll('.em-v2-card__title')
  for (const title of titles) {
    if (title.textContent?.trim() === 'Entreno de Hoy') {
      return title.closest('.em-v2-card')
    }
  }
  return null
}

export function readWorkoutHistorySectionKicker(): string | null {
  const card = findEntrenoDeHoyHistoryCard()
  const detail = card?.querySelector('.em-v2-card__detail')
  return detail?.textContent?.trim() ?? null
}

export function readWorkoutHistoryRowSummaries(): string[] {
  const list = document.querySelector('.em-v2-training-history')
  if (!list) return []
  return [...list.querySelectorAll(`.${WORKOUT_HISTORY_SUMMARY_CLASS}`)].map((el) =>
    el.textContent?.trim() ?? ''
  )
}

export function countWorkoutHistoryPrBadges(): number {
  return document.querySelectorAll('.em-v2-training-history__badge--pr').length
}

export function readWorkoutHistorySparklineAriaLabels(): string[] {
  return [...document.querySelectorAll('.em-v2-training-history__sparkline')]
    .map((el) => el.getAttribute('aria-label') ?? '')
    .filter(Boolean)
}