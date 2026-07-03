/** Inventario E2E historial v2 fila completo — 3 suites (oleada 443). */
import { unionWorkoutHistoryCovers } from './e2eWorkoutHistoryCoverage'
import { isWorkoutHistoryPostV2E2ECoverageComplete } from './e2eWorkoutHistoryPostV2Coverage'
import { isWorkoutHistoryRowPrCoverageComplete } from './e2eWorkoutHistoryRowPrCoverage'
import { isTrainingPolishWorkoutHistoryV2RowClosed } from './trainingPolishWorkoutHistoryV2Suite'

export const WORKOUT_HISTORY_FULL_COVERAGE_MODULES = [
  'e2eWorkoutHistoryRowPrCoverage',
  'e2eWorkoutHistoryCoverage',
  'e2eWorkoutHistoryPostV2Coverage',
] as const

export type WorkoutHistoryFullCoverageModule =
  (typeof WORKOUT_HISTORY_FULL_COVERAGE_MODULES)[number]

export function countWorkoutHistoryCoverageSuites(): number {
  return WORKOUT_HISTORY_FULL_COVERAGE_MODULES.length
}

export function e2eWorkoutHistoryFullBlockRange(): { from: number; to: number } {
  return { from: 440, to: 443 }
}

export function isWorkoutHistoryFullE2ECoverageComplete(): boolean {
  return (
    isWorkoutHistoryRowPrCoverageComplete() &&
    isTrainingPolishWorkoutHistoryV2RowClosed(443) &&
    unionWorkoutHistoryCovers().includes('history-row-pr-tone') &&
    isWorkoutHistoryPostV2E2ECoverageComplete()
  )
}