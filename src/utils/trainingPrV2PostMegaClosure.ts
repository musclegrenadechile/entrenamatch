/** Cierre post-mega PR v2 entrenamiento oleadas 451–452 (oleada 453). */
import { countE2ETrainingPolishBridgeEntries } from './e2eTrainingPolishBridge'
import { isTrainingPostPrMegaFullE2ECoverageComplete } from './e2eTrainingPostPrMegaFullCoverage'
import { isWorkoutHistoryV2GlobalFullE2ECoverageComplete } from './e2eWorkoutHistoryV2GlobalFullCoverage'
import { isTrainingPolishPostPrMegaClosed } from './trainingPolishPostPrMegaSuite'
import { isTrainingPolishWorkoutHistoryV2GlobalClosed } from './trainingPolishWorkoutHistoryV2GlobalSuite'

export const TRAINING_PR_V2_POST_MEGA_CLOSED_OLEADA = 453

export const TRAINING_PR_V2_POST_MEGA_BLOCK_CLOSURES = [
  { block: 'post-pr-mega', oleada: 452 },
  { block: 'history-v2-global', oleada: 452 },
] as const

export function trainingPrV2PostMegaBlockRange(): { from: number; to: number } {
  return { from: 451, to: 453 }
}

export function countTrainingPrV2PostMegaBlockClosures(): number {
  return TRAINING_PR_V2_POST_MEGA_BLOCK_CLOSURES.length
}

export function isTrainingPrV2PostMegaClosureComplete(
  oleada = TRAINING_PR_V2_POST_MEGA_CLOSED_OLEADA
): boolean {
  if (oleada < TRAINING_PR_V2_POST_MEGA_CLOSED_OLEADA) return false
  return (
    isTrainingPolishPostPrMegaClosed(452) &&
    isTrainingPolishWorkoutHistoryV2GlobalClosed(452) &&
    isTrainingPostPrMegaFullE2ECoverageComplete() &&
    isWorkoutHistoryV2GlobalFullE2ECoverageComplete() &&
    countE2ETrainingPolishBridgeEntries() >= 102
  )
}