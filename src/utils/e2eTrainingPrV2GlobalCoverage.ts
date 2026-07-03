/** Inventario E2E cierre global PR v2 entrenamiento 436–443 (oleada 444). */
import { isTrainingPrV2GlobalClosureComplete } from './trainingPrV2GlobalClosure'

export const TRAINING_PR_V2_GLOBAL_COVERAGE_MODULES = [
  'trainingPrV2Suite',
  'e2eGymLogFullCoverage',
  'e2ePostWorkoutFullCoverage',
  'e2eWorkoutHistoryFullCoverage',
  'e2eTrainingPolishBridge',
  'trainingPrV2GlobalClosure',
] as const

export type TrainingPrV2GlobalCoverageModule =
  (typeof TRAINING_PR_V2_GLOBAL_COVERAGE_MODULES)[number]

export function countTrainingPrV2GlobalCoverageModules(): number {
  return TRAINING_PR_V2_GLOBAL_COVERAGE_MODULES.length
}

export function e2eTrainingPrV2GlobalBlockRange(): { from: number; to: number } {
  return { from: 436, to: 444 }
}

export function isE2ETrainingPrV2GlobalCoverageComplete(): boolean {
  return isTrainingPrV2GlobalClosureComplete(444)
}