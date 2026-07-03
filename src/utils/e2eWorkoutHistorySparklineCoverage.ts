/** Registro E2E sparkline historial v2 — union de specs sparkline-pr (oleada 449). */
import { E2E_WORKOUT_HISTORY_SPARKLINE_PR_SPECS } from './e2eWorkoutHistorySparklinePrCoverage'

export type E2EWorkoutHistorySparklineCover = 'sparkline-pr-tone' | 'harness' | 'aria'

export type E2EWorkoutHistorySparklineSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2EWorkoutHistorySparklineCover[]
}

export const E2E_WORKOUT_HISTORY_SPARKLINE_SPECS: readonly E2EWorkoutHistorySparklineSpecEntry[] =
  [...E2E_WORKOUT_HISTORY_SPARKLINE_PR_SPECS] as const

export function countE2EWorkoutHistorySparklineSpecs(): number {
  return E2E_WORKOUT_HISTORY_SPARKLINE_SPECS.length
}

export function unionWorkoutHistorySparklineCovers(): E2EWorkoutHistorySparklineCover[] {
  const all = new Set<E2EWorkoutHistorySparklineCover>()
  for (const spec of E2E_WORKOUT_HISTORY_SPARKLINE_SPECS) {
    for (const cover of spec.covers) all.add(cover)
  }
  return [...all]
}

export function workoutHistorySparklineSpecFileBasenames(): string[] {
  return E2E_WORKOUT_HISTORY_SPARKLINE_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}