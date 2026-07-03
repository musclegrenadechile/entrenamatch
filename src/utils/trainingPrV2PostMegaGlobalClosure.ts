/** Cierre post-mega global PR v2 entrenamiento oleadas 451–454 (oleada 454). */
import { countE2ETrainingPolishBridgeEntries } from './e2eTrainingPolishBridge'
import { isTrainingPostPrMegaFullV2PostE2ECoverageComplete } from './e2eTrainingPostPrMegaFullV2PostCoverage'
import { isE2ETrainingPrV2PostMegaCoverageComplete } from './e2eTrainingPrV2PostMegaCoverage'
import { isTrainingPrV2PostMegaClosureComplete } from './trainingPrV2PostMegaClosure'
import { isTrainingPolishPrV2PostMegaClosed } from './trainingPolishPrV2PostMegaSuite'

export const TRAINING_PR_V2_POST_MEGA_GLOBAL_CLOSED_OLEADA = 454

export const TRAINING_PR_V2_POST_MEGA_GLOBAL_BLOCK_CLOSURES = [
  { block: 'post-pr-mega', oleada: 453 },
  { block: 'history-v2-global-full', oleada: 453 },
  { block: 'mega-post-pr-full-v2', oleada: 454 },
] as const

export function trainingPrV2PostMegaGlobalBlockRange(): { from: number; to: number } {
  return { from: 451, to: 454 }
}

export function countTrainingPrV2PostMegaGlobalBlockClosures(): number {
  return TRAINING_PR_V2_POST_MEGA_GLOBAL_BLOCK_CLOSURES.length
}

export function isTrainingPrV2PostMegaGlobalClosureComplete(
  oleada = TRAINING_PR_V2_POST_MEGA_GLOBAL_CLOSED_OLEADA
): boolean {
  if (oleada < TRAINING_PR_V2_POST_MEGA_GLOBAL_CLOSED_OLEADA) return false
  return (
    isTrainingPolishPrV2PostMegaClosed(453) &&
    isTrainingPrV2PostMegaClosureComplete(453) &&
    isE2ETrainingPrV2PostMegaCoverageComplete() &&
    isTrainingPostPrMegaFullV2PostE2ECoverageComplete() &&
    countE2ETrainingPolishBridgeEntries() >= 105
  )
}