/** Cierre global historial v2 entrenamiento oleadas 440–449 (oleada 452). */
import { countE2ETrainingPolishBridgeEntries } from './e2eTrainingPolishBridge'
import { isWorkoutHistoryFullE2ECoverageComplete } from './e2eWorkoutHistoryFullCoverage'
import { isWorkoutHistorySparklineFullE2ECoverageComplete } from './e2eWorkoutHistorySparklineFullCoverage'
import {
  isTrainingPolishWorkoutHistoryV2Closed,
  isTrainingPolishWorkoutHistoryV2RowClosed,
  trainingPolishWorkoutHistoryV2Range,
} from './trainingPolishWorkoutHistoryV2Suite'

export const TRAINING_WORKOUT_HISTORY_V2_GLOBAL_CLOSED_OLEADA = 452

export const TRAINING_WORKOUT_HISTORY_V2_BLOCK_CLOSURES = [
  { block: 'history-row-v2', oleada: 443 },
  { block: 'history-sparkline-v2', oleada: 449 },
] as const

export function trainingWorkoutHistoryV2GlobalBlockRange(): { from: number; to: number } {
  return trainingPolishWorkoutHistoryV2Range()
}

export function countTrainingWorkoutHistoryV2BlockClosures(): number {
  return TRAINING_WORKOUT_HISTORY_V2_BLOCK_CLOSURES.length
}

export function isTrainingWorkoutHistoryV2GlobalClosureComplete(
  oleada = TRAINING_WORKOUT_HISTORY_V2_GLOBAL_CLOSED_OLEADA
): boolean {
  if (oleada < TRAINING_WORKOUT_HISTORY_V2_GLOBAL_CLOSED_OLEADA) return false
  const { from, to } = trainingPolishWorkoutHistoryV2Range()
  return (
    from === 440 &&
    to === 449 &&
    isTrainingPolishWorkoutHistoryV2RowClosed(443) &&
    isTrainingPolishWorkoutHistoryV2Closed(449) &&
    isWorkoutHistoryFullE2ECoverageComplete() &&
    isWorkoutHistorySparklineFullE2ECoverageComplete() &&
    countE2ETrainingPolishBridgeEntries() >= 99
  )
}