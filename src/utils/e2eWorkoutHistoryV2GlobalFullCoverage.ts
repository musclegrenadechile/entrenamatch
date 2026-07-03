/** Inventario E2E historial v2 global completo — 3 suites (oleada 453). */
import { isE2EWorkoutHistoryV2GlobalCoverageComplete } from './e2eWorkoutHistoryV2GlobalCoverage'
import { isWorkoutHistoryFullE2ECoverageComplete } from './e2eWorkoutHistoryFullCoverage'
import { isWorkoutHistorySparklineFullE2ECoverageComplete } from './e2eWorkoutHistorySparklineFullCoverage'
import { unionWorkoutHistoryCovers } from './e2eWorkoutHistoryCoverage'
import { isTrainingPolishWorkoutHistoryV2GlobalClosed } from './trainingPolishWorkoutHistoryV2GlobalSuite'
import { unionWorkoutHistorySparklineCovers } from './e2eWorkoutHistorySparklineCoverage'
import { isTrainingWorkoutHistoryV2GlobalClosureComplete } from './trainingWorkoutHistoryV2GlobalClosure'

export const WORKOUT_HISTORY_V2_GLOBAL_FULL_COVERAGE_MODULES = [
  'e2eWorkoutHistoryFullCoverage',
  'e2eWorkoutHistorySparklineFullCoverage',
  'e2eWorkoutHistoryV2GlobalCoverage',
] as const

export type WorkoutHistoryV2GlobalFullCoverageModule =
  (typeof WORKOUT_HISTORY_V2_GLOBAL_FULL_COVERAGE_MODULES)[number]

export function countWorkoutHistoryV2GlobalCoverageSuites(): number {
  return WORKOUT_HISTORY_V2_GLOBAL_FULL_COVERAGE_MODULES.length
}

export function e2eWorkoutHistoryV2GlobalFullBlockRange(): { from: number; to: number } {
  return { from: 440, to: 453 }
}

export function isWorkoutHistoryV2GlobalFullE2ECoverageComplete(): boolean {
  return (
    isWorkoutHistoryFullE2ECoverageComplete() &&
    isWorkoutHistorySparklineFullE2ECoverageComplete() &&
    isTrainingPolishWorkoutHistoryV2GlobalClosed(452) &&
    unionWorkoutHistoryCovers().includes('history-row-pr-tone') &&
    unionWorkoutHistorySparklineCovers().includes('sparkline-pr-tone') &&
    isTrainingWorkoutHistoryV2GlobalClosureComplete(452) &&
    isE2EWorkoutHistoryV2GlobalCoverageComplete()
  )
}