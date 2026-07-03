/** Inventario E2E cierre post-mega PR v2 entrenamiento 451–453 (oleada 453). */
import { isTrainingPrV2PostMegaClosureComplete } from './trainingPrV2PostMegaClosure'

export const TRAINING_PR_V2_POST_MEGA_COVERAGE_MODULES = [
  'e2eTrainingPostPrMegaFullCoverage',
  'e2eWorkoutHistoryV2GlobalFullCoverage',
  'e2eTrainingPlaywrightPrSmokeCoverage',
  'trainingPrV2PostMegaClosure',
] as const

export type TrainingPrV2PostMegaCoverageModule =
  (typeof TRAINING_PR_V2_POST_MEGA_COVERAGE_MODULES)[number]

export function countTrainingPrV2PostMegaCoverageModules(): number {
  return TRAINING_PR_V2_POST_MEGA_COVERAGE_MODULES.length
}

export function e2eTrainingPrV2PostMegaBlockRange(): { from: number; to: number } {
  return { from: 451, to: 453 }
}

export function isE2ETrainingPrV2PostMegaCoverageComplete(): boolean {
  return isTrainingPrV2PostMegaClosureComplete(453)
}