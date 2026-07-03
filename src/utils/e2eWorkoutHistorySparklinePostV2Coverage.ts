/** Inventario E2E cierre sparkline historial v2 oleadas 448–449 (oleada 449). */
import { unionWorkoutHistorySparklineCovers } from './e2eWorkoutHistorySparklineCoverage'
import { isWorkoutHistorySparklinePrCoverageComplete } from './e2eWorkoutHistorySparklinePrCoverage'
import { isTrainingPolishWorkoutHistoryV2Closed } from './trainingPolishWorkoutHistoryV2Suite'

export const WORKOUT_HISTORY_SPARKLINE_POST_V2_COVERAGE_MODULES = [
  'workoutHistorySparklinePrToneDisplay',
  'e2eWorkoutHistorySparklinePrCoverage',
] as const

export type WorkoutHistorySparklinePostV2CoverageModule =
  (typeof WORKOUT_HISTORY_SPARKLINE_POST_V2_COVERAGE_MODULES)[number]

const POST_V2_COVERS = ['sparkline-pr-tone'] as const

export function countWorkoutHistorySparklinePostV2CoverageModules(): number {
  return WORKOUT_HISTORY_SPARKLINE_POST_V2_COVERAGE_MODULES.length
}

export function e2eWorkoutHistorySparklinePostV2BlockRange(): { from: number; to: number } {
  return { from: 448, to: 449 }
}

export function isWorkoutHistorySparklinePostV2E2ECoverageComplete(): boolean {
  const covers = unionWorkoutHistorySparklineCovers()
  return (
    isTrainingPolishWorkoutHistoryV2Closed(449) &&
    isWorkoutHistorySparklinePrCoverageComplete() &&
    POST_V2_COVERS.every((c) => covers.includes(c))
  )
}