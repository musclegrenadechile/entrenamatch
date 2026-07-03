/** Registro E2E historial v2 — union de specs history-row-pr (oleada 443). */
import { E2E_WORKOUT_HISTORY_ROW_PR_SPECS } from './e2eWorkoutHistoryRowPrCoverage'

export type E2EWorkoutHistoryCover = 'history-row-pr-tone' | 'harness' | 'aria'

export type E2EWorkoutHistorySpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2EWorkoutHistoryCover[]
}

export const E2E_WORKOUT_HISTORY_SPECS: readonly E2EWorkoutHistorySpecEntry[] = [
  ...E2E_WORKOUT_HISTORY_ROW_PR_SPECS,
] as const

export function countE2EWorkoutHistorySpecs(): number {
  return E2E_WORKOUT_HISTORY_SPECS.length
}

export function unionWorkoutHistoryCovers(): E2EWorkoutHistoryCover[] {
  const all = new Set<E2EWorkoutHistoryCover>()
  for (const spec of E2E_WORKOUT_HISTORY_SPECS) {
    for (const cover of spec.covers) all.add(cover)
  }
  return [...all]
}

export function workoutHistorySpecFileBasenames(): string[] {
  return E2E_WORKOUT_HISTORY_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}