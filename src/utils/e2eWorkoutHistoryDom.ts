import { WORKOUT_HISTORY_SUMMARY_CLASS } from './workoutHistoryDisplay'
import { WORKOUT_HISTORY_ROW_CLASS } from './workoutHistoryRowPrToneDisplay'
import {
  sparklinePrAriaMatchesPr,
  WORKOUT_HISTORY_SPARKLINE_PR_TONE_CLASS,
} from './workoutHistorySparklinePrToneDisplay'

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

export function readWorkoutHistoryRowToneClass(): string | null {
  const row = document.querySelector(`.${WORKOUT_HISTORY_ROW_CLASS}--has-pr`)
  if (!row) return null
  return `${WORKOUT_HISTORY_ROW_CLASS}--has-pr`
}

export function readWorkoutHistorySummaryToneClass(): string | null {
  const summary = document.querySelector(`.${WORKOUT_HISTORY_SUMMARY_CLASS}--has-pr`)
  if (!summary) return null
  return `${WORKOUT_HISTORY_SUMMARY_CLASS}--has-pr`
}

export function readWorkoutHistorySummaryPrAriaLabel(): string | null {
  const summary = document.querySelector(`.${WORKOUT_HISTORY_SUMMARY_CLASS}--has-pr`)
  return summary?.getAttribute('aria-label')?.trim() ?? null
}

export function readWorkoutHistorySparklineToneClass(): string | null {
  const sparkline = document.querySelector(`.${WORKOUT_HISTORY_SPARKLINE_PR_TONE_CLASS}`)
  if (!sparkline) return null
  return WORKOUT_HISTORY_SPARKLINE_PR_TONE_CLASS
}

export function readWorkoutHistorySparklinePrAriaLabel(): string | null {
  const sparkline = document.querySelector(`.${WORKOUT_HISTORY_SPARKLINE_PR_TONE_CLASS}`)
  return sparkline?.getAttribute('aria-label')?.trim() ?? null
}

export function isWorkoutHistorySparklinePrToneAriaExpected(): boolean {
  return sparklinePrAriaMatchesPr(readWorkoutHistorySparklinePrAriaLabel())
}

/** Harness E2E sparkline historial PR v2 (oleada 448). */
export const workoutHistorySparklineE2EHarness = {
  getWorkoutHistorySparklineToneClass: readWorkoutHistorySparklineToneClass,
  getWorkoutHistorySparklinePrAriaLabel: readWorkoutHistorySparklinePrAriaLabel,
  isWorkoutHistorySparklinePrToneAriaExpected,
} as const