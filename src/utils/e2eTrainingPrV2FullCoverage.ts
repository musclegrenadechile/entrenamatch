/** Inventario E2E PR v2 completo — 4 suites (oleada 444). */
import { isTrainingPrV2CoverageComplete } from './e2eTrainingPrV2Coverage'
import { isGymLogFullE2ECoverageComplete } from './e2eGymLogFullCoverage'
import { isPostWorkoutFullE2ECoverageComplete } from './e2ePostWorkoutFullCoverage'
import { isE2ETrainingPrV2GlobalCoverageComplete } from './e2eTrainingPrV2GlobalCoverage'
import { isWorkoutHistoryFullE2ECoverageComplete } from './e2eWorkoutHistoryFullCoverage'
import { isTrainingPrV2GlobalClosureComplete } from './trainingPrV2GlobalClosure'

export const TRAINING_PR_V2_FULL_COVERAGE_MODULES = [
  'e2eGymLogFullCoverage',
  'e2ePostWorkoutFullCoverage',
  'e2eWorkoutHistoryFullCoverage',
  'e2eTrainingPrV2GlobalCoverage',
] as const

export type TrainingPrV2FullCoverageModule =
  (typeof TRAINING_PR_V2_FULL_COVERAGE_MODULES)[number]

export function countTrainingPrV2CoverageSuites(): number {
  return TRAINING_PR_V2_FULL_COVERAGE_MODULES.length
}

export function e2eTrainingPrV2FullBlockRange(): { from: number; to: number } {
  return { from: 436, to: 444 }
}

export function isTrainingPrV2FullE2ECoverageComplete(): boolean {
  return (
    isGymLogFullE2ECoverageComplete() &&
    isPostWorkoutFullE2ECoverageComplete() &&
    isWorkoutHistoryFullE2ECoverageComplete() &&
    isTrainingPrV2GlobalClosureComplete(444) &&
    isE2ETrainingPrV2GlobalCoverageComplete() &&
    isTrainingPrV2CoverageComplete()
  )
}