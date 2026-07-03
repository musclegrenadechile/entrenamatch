/** Inventario E2E mega post-PR completo — 5 suites (oleada 451). */
import { isTrainingFullFlowPrCoverageComplete } from './e2eTrainingFullFlowPrCoverage'
import { isTrainingPostPrMegaCoverageComplete } from './e2eTrainingPostPrMegaCoverage'
import { isTrainingPrV2FullE2ECoverageComplete } from './e2eTrainingPrV2FullCoverage'
import { isTrainingReviewFullE2ECoverageComplete } from './e2eTrainingReviewFullCoverage'
import { isWorkoutHistorySparklineFullE2ECoverageComplete } from './e2eWorkoutHistorySparklineFullCoverage'

export const TRAINING_POST_PR_MEGA_FULL_COVERAGE_MODULES = [
  'e2eTrainingPrV2FullCoverage',
  'e2eTrainingPostPrMegaCoverage',
  'e2eTrainingReviewFullCoverage',
  'e2eWorkoutHistorySparklineFullCoverage',
  'e2eTrainingFullFlowPrCoverage',
] as const

export type TrainingPostPrMegaFullCoverageModule =
  (typeof TRAINING_POST_PR_MEGA_FULL_COVERAGE_MODULES)[number]

export function countTrainingPostPrMegaCoverageSuites(): number {
  return TRAINING_POST_PR_MEGA_FULL_COVERAGE_MODULES.length
}

export function e2eTrainingPostPrMegaFullBlockRange(): { from: number; to: number } {
  return { from: 436, to: 451 }
}

export function isTrainingPostPrMegaFullE2ECoverageComplete(): boolean {
  return (
    isTrainingPrV2FullE2ECoverageComplete() &&
    isTrainingReviewFullE2ECoverageComplete() &&
    isWorkoutHistorySparklineFullE2ECoverageComplete() &&
    isTrainingFullFlowPrCoverageComplete() &&
    isTrainingPostPrMegaCoverageComplete()
  )
}