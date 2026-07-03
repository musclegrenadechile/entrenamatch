/** Cierre global PR v2 entrenamiento oleadas 436–443 (oleada 444). */
import { countE2ETrainingPolishBridgeEntries } from './e2eTrainingPolishBridge'
import { isGymLogFullE2ECoverageComplete } from './e2eGymLogFullCoverage'
import { isPostWorkoutFullE2ECoverageComplete } from './e2ePostWorkoutFullCoverage'
import { isWorkoutHistoryFullE2ECoverageComplete } from './e2eWorkoutHistoryFullCoverage'
import { isTrainingPolishGymLogV2Closed } from './trainingPolishGymLogV2Suite'
import { isTrainingPolishPostWorkoutV2Closed } from './trainingPolishPostWorkoutV2Suite'
import { isTrainingPolishWorkoutHistoryV2Closed } from './trainingPolishWorkoutHistoryV2Suite'
import {
  areAllTrainingPrV2SubBlocksClosed,
  countTrainingPrV2Blocks,
  countTrainingPrV2Oleadas,
  isTrainingPrV2FullyClosed,
  TRAINING_PR_V2_BLOCKS,
  trainingPrV2FullRange,
} from './trainingPrV2Suite'

export const TRAINING_PR_V2_GLOBAL_CLOSED_OLEADA = 444

export const TRAINING_PR_V2_BLOCK_CLOSURES = [
  { block: 'gym-log-v2', oleada: 438 },
  { block: 'post-workout-v2', oleada: 442 },
  { block: 'history-v2', oleada: 443 },
] as const

export function trainingPrV2GlobalBlockRange(): { from: number; to: number } {
  return trainingPrV2FullRange()
}

export function countTrainingPrV2BlockClosures(): number {
  return TRAINING_PR_V2_BLOCK_CLOSURES.length
}

export function isTrainingPrV2GlobalClosureComplete(
  oleada = TRAINING_PR_V2_GLOBAL_CLOSED_OLEADA
): boolean {
  if (oleada < TRAINING_PR_V2_GLOBAL_CLOSED_OLEADA) return false
  const { from, to } = trainingPrV2FullRange()
  return (
    from === 436 &&
    to === 444 &&
    countTrainingPrV2Blocks() === 4 &&
    countTrainingPrV2Oleadas() === 8 &&
    TRAINING_PR_V2_BLOCKS.length === 4 &&
    areAllTrainingPrV2SubBlocksClosed(444) &&
    isTrainingPrV2FullyClosed(444) &&
    isTrainingPolishGymLogV2Closed(438) &&
    isTrainingPolishPostWorkoutV2Closed(442) &&
    isTrainingPolishWorkoutHistoryV2Closed(443) &&
    isGymLogFullE2ECoverageComplete() &&
    isPostWorkoutFullE2ECoverageComplete() &&
    isWorkoutHistoryFullE2ECoverageComplete() &&
    countE2ETrainingPolishBridgeEntries() >= 86
  )
}