/** Inventario E2E cierre historial v2 oleadas 440–443 (oleada 443). */
import { unionWorkoutHistoryCovers } from './e2eWorkoutHistoryCoverage'
import { isWorkoutHistoryRowPrCoverageComplete } from './e2eWorkoutHistoryRowPrCoverage'
import { isTrainingPolishWorkoutHistoryV2RowClosed } from './trainingPolishWorkoutHistoryV2Suite'

export const WORKOUT_HISTORY_POST_V2_COVERAGE_MODULES = [
  'workoutHistoryRowPrToneDisplay',
  'e2eWorkoutHistoryRowPrCoverage',
] as const

export type WorkoutHistoryPostV2CoverageModule =
  (typeof WORKOUT_HISTORY_POST_V2_COVERAGE_MODULES)[number]

const POST_V2_COVERS = ['history-row-pr-tone'] as const

export function countWorkoutHistoryPostV2CoverageModules(): number {
  return WORKOUT_HISTORY_POST_V2_COVERAGE_MODULES.length
}

export function e2eWorkoutHistoryPostV2BlockRange(): { from: number; to: number } {
  return { from: 440, to: 443 }
}

export function isWorkoutHistoryPostV2E2ECoverageComplete(): boolean {
  const covers = unionWorkoutHistoryCovers()
  return (
    isTrainingPolishWorkoutHistoryV2RowClosed(443) &&
    isWorkoutHistoryRowPrCoverageComplete() &&
    POST_V2_COVERS.every((c) => covers.includes(c))
  )
}