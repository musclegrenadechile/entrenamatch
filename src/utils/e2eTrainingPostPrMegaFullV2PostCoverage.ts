/** Inventario E2E cierre mega post-PR full v2 oleadas 452–454 (oleada 454). */
import { isTrainingPlaywrightPrSmokeRunReady } from './e2eTrainingPlaywrightPrSmokeRun'
import { isTrainingPostPrMegaFullV2E2ECoverageComplete } from './e2eTrainingPostPrMegaFullV2Coverage'
import { isTrainingPolishPrV2PostMegaGlobalClosed } from './trainingPolishPrV2PostMegaGlobalSuite'

export const TRAINING_POST_PR_MEGA_FULL_V2_POST_COVERAGE_MODULES = [
  'e2eTrainingPostPrMegaFullV2Coverage',
  'e2eTrainingPlaywrightPrSmokeRun',
] as const

export type TrainingPostPrMegaFullV2PostCoverageModule =
  (typeof TRAINING_POST_PR_MEGA_FULL_V2_POST_COVERAGE_MODULES)[number]

export function countTrainingPostPrMegaFullV2PostCoverageModules(): number {
  return TRAINING_POST_PR_MEGA_FULL_V2_POST_COVERAGE_MODULES.length
}

export function e2eTrainingPostPrMegaFullV2PostBlockRange(): { from: number; to: number } {
  return { from: 452, to: 454 }
}

export function isTrainingPostPrMegaFullV2PostE2ECoverageComplete(): boolean {
  return (
    isTrainingPolishPrV2PostMegaGlobalClosed(454) &&
    isTrainingPostPrMegaFullV2E2ECoverageComplete() &&
    isTrainingPlaywrightPrSmokeRunReady()
  )
}