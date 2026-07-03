/** Inventario E2E sparkline historial v2 completo — 3 suites (oleada 449). */
import { unionWorkoutHistorySparklineCovers } from './e2eWorkoutHistorySparklineCoverage'
import { isWorkoutHistorySparklinePostV2E2ECoverageComplete } from './e2eWorkoutHistorySparklinePostV2Coverage'
import { isWorkoutHistorySparklinePrCoverageComplete } from './e2eWorkoutHistorySparklinePrCoverage'
import { isTrainingPolishWorkoutHistoryV2Closed } from './trainingPolishWorkoutHistoryV2Suite'

export const WORKOUT_HISTORY_SPARKLINE_FULL_COVERAGE_MODULES = [
  'e2eWorkoutHistorySparklinePrCoverage',
  'e2eWorkoutHistorySparklineCoverage',
  'e2eWorkoutHistorySparklinePostV2Coverage',
] as const

export type WorkoutHistorySparklineFullCoverageModule =
  (typeof WORKOUT_HISTORY_SPARKLINE_FULL_COVERAGE_MODULES)[number]

export function countWorkoutHistorySparklineCoverageSuites(): number {
  return WORKOUT_HISTORY_SPARKLINE_FULL_COVERAGE_MODULES.length
}

export function e2eWorkoutHistorySparklineFullBlockRange(): { from: number; to: number } {
  return { from: 448, to: 449 }
}

export function isWorkoutHistorySparklineFullE2ECoverageComplete(): boolean {
  return (
    isWorkoutHistorySparklinePrCoverageComplete() &&
    isTrainingPolishWorkoutHistoryV2Closed(449) &&
    unionWorkoutHistorySparklineCovers().includes('sparkline-pr-tone') &&
    isWorkoutHistorySparklinePostV2E2ECoverageComplete()
  )
}