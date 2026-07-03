/** Inventario E2E cierre mega global entrenamiento 361–434 (oleada 435). */
import { isTrainingMegaGlobalClosureComplete } from './trainingMegaGlobalClosure'

export const TRAINING_MEGA_GLOBAL_COVERAGE_MODULES = [
  'trainingMegaSuite',
  'e2eFuelPlanFullCoverage',
  'e2eTrainingPolishBridge',
  'trainingMegaGlobalClosure',
] as const

export type TrainingMegaGlobalCoverageModule =
  (typeof TRAINING_MEGA_GLOBAL_COVERAGE_MODULES)[number]

export function countTrainingMegaGlobalCoverageModules(): number {
  return TRAINING_MEGA_GLOBAL_COVERAGE_MODULES.length
}

export function e2eTrainingMegaGlobalBlockRange(): { from: number; to: number } {
  return { from: 361, to: 435 }
}

export function isE2ETrainingMegaGlobalCoverageComplete(): boolean {
  return isTrainingMegaGlobalClosureComplete(435)
}