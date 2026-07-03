/** Inventario E2E cierre post-mega global PR v2 entrenamiento 451–454 (oleada 454). */
import { isTrainingPrV2PostMegaGlobalClosureComplete } from './trainingPrV2PostMegaGlobalClosure'

export const TRAINING_PR_V2_POST_MEGA_GLOBAL_COVERAGE_MODULES = [
  'e2eTrainingPrV2PostMegaCoverage',
  'e2eTrainingPostPrMegaFullV2Coverage',
  'e2eTrainingPostPrMegaFullV2PostCoverage',
  'e2eTrainingPlaywrightPrSmokeRun',
  'trainingPrV2PostMegaGlobalClosure',
] as const

export type TrainingPrV2PostMegaGlobalCoverageModule =
  (typeof TRAINING_PR_V2_POST_MEGA_GLOBAL_COVERAGE_MODULES)[number]

export function countTrainingPrV2PostMegaGlobalCoverageModules(): number {
  return TRAINING_PR_V2_POST_MEGA_GLOBAL_COVERAGE_MODULES.length
}

export function e2eTrainingPrV2PostMegaGlobalBlockRange(): { from: number; to: number } {
  return { from: 451, to: 454 }
}

export function isE2ETrainingPrV2PostMegaGlobalCoverageComplete(): boolean {
  return isTrainingPrV2PostMegaGlobalClosureComplete(454)
}