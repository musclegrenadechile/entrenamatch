/** Inventario E2E cierre global historial v2 entrenamiento 440–449 (oleada 452). */
import { isTrainingWorkoutHistoryV2GlobalClosureComplete } from './trainingWorkoutHistoryV2GlobalClosure'

export const WORKOUT_HISTORY_V2_GLOBAL_COVERAGE_MODULES = [
  'trainingPolishWorkoutHistoryV2Suite',
  'e2eWorkoutHistoryFullCoverage',
  'e2eWorkoutHistorySparklineFullCoverage',
  'e2eTrainingPolishBridge',
  'trainingWorkoutHistoryV2GlobalClosure',
] as const

export type WorkoutHistoryV2GlobalCoverageModule =
  (typeof WORKOUT_HISTORY_V2_GLOBAL_COVERAGE_MODULES)[number]

export function countWorkoutHistoryV2GlobalCoverageModules(): number {
  return WORKOUT_HISTORY_V2_GLOBAL_COVERAGE_MODULES.length
}

export function e2eWorkoutHistoryV2GlobalBlockRange(): { from: number; to: number } {
  return { from: 440, to: 452 }
}

export function isE2EWorkoutHistoryV2GlobalCoverageComplete(): boolean {
  return isTrainingWorkoutHistoryV2GlobalClosureComplete(452)
}