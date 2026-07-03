/** Inventario E2E smoke Playwright PR — 2 specs CI (oleada 453). */
import { E2E_TRAINING_MEGA_FLOW_PR_SPECS } from './e2eTrainingMegaFlowPrCoverage'
import { E2E_WORKOUT_HISTORY_ROW_PR_SPECS } from './e2eWorkoutHistoryRowPrCoverage'
import { E2E_WORKOUT_HISTORY_SPARKLINE_PR_SPECS } from './e2eWorkoutHistorySparklinePrCoverage'
import { isTrainingMegaFlowPrCoverageComplete } from './e2eTrainingMegaFlowPrCoverage'
import { isWorkoutHistoryRowPrCoverageComplete } from './e2eWorkoutHistoryRowPrCoverage'
import { isWorkoutHistorySparklinePrCoverageComplete } from './e2eWorkoutHistorySparklinePrCoverage'

export type E2ETrainingPlaywrightPrSmokeCover =
  | 'mega-flow-review-pr'
  | 'history-row-pr-tone'
  | 'sparkline-pr-tone'
  | 'harness'
  | 'aria'

export type E2ETrainingPlaywrightPrSmokeSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2ETrainingPlaywrightPrSmokeCover[]
}

export const E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_SPECS: readonly E2ETrainingPlaywrightPrSmokeSpecEntry[] =
  [
    ...E2E_TRAINING_MEGA_FLOW_PR_SPECS,
    ...E2E_WORKOUT_HISTORY_ROW_PR_SPECS,
    ...E2E_WORKOUT_HISTORY_SPARKLINE_PR_SPECS,
  ] as const

const PR_SMOKE_TONE_COVERS = [
  'mega-flow-review-pr',
  'history-row-pr-tone',
  'sparkline-pr-tone',
] as const

/** Archivos Playwright ejecutados en CI e2e-smoke (oleada 453). */
export const E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_CI_FILES = [
  'e2e/training-mega-flow.spec.ts',
  'e2e/workout-history-flow.spec.ts',
] as const

export function countE2ETrainingPlaywrightPrSmokeSpecs(): number {
  return E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_SPECS.length
}

export function unionTrainingPlaywrightPrSmokeCovers(): E2ETrainingPlaywrightPrSmokeCover[] {
  const all = new Set<E2ETrainingPlaywrightPrSmokeCover>()
  for (const spec of E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_SPECS) {
    for (const cover of spec.covers) all.add(cover)
  }
  return [...all]
}

export function trainingPlaywrightPrSmokeSpecFileBasenames(): string[] {
  return E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_CI_FILES.map((f) => f.replace(/^e2e\//, ''))
}

export function e2eTrainingPlaywrightPrSmokeBlockRange(): { from: number; to: number } {
  return { from: 440, to: 453 }
}

export function isTrainingPlaywrightPrSmokeCoverageComplete(): boolean {
  const covers = unionTrainingPlaywrightPrSmokeCovers()
  return (
    isTrainingMegaFlowPrCoverageComplete() &&
    isWorkoutHistoryRowPrCoverageComplete() &&
    isWorkoutHistorySparklinePrCoverageComplete() &&
    PR_SMOKE_TONE_COVERS.every((c) => covers.includes(c))
  )
}