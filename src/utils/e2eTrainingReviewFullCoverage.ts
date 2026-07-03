/** Inventario E2E reseña v2 completo — 2 suites (oleada 446). */
import { isTrainingReviewPostV2E2ECoverageComplete } from './e2eTrainingReviewPostV2Coverage'
import { unionTrainingReviewCovers } from './e2eTrainingReviewCoverage'
import { isTrainingReviewPrCoverageComplete } from './e2eTrainingReviewPrCoverage'
import { isTrainingPolishReviewV2Closed } from './trainingPolishReviewV2Suite'

export const TRAINING_REVIEW_FULL_COVERAGE_MODULES = [
  'e2eTrainingReviewPrCoverage',
  'e2eTrainingReviewPostV2Coverage',
] as const

export type TrainingReviewFullCoverageModule =
  (typeof TRAINING_REVIEW_FULL_COVERAGE_MODULES)[number]

export function countTrainingReviewCoverageSuites(): number {
  return TRAINING_REVIEW_FULL_COVERAGE_MODULES.length
}

export function e2eTrainingReviewFullBlockRange(): { from: number; to: number } {
  return { from: 445, to: 446 }
}

export function isTrainingReviewFullE2ECoverageComplete(): boolean {
  return (
    isTrainingReviewPrCoverageComplete() &&
    isTrainingPolishReviewV2Closed(446) &&
    unionTrainingReviewCovers().includes('review-pr-tone') &&
    isTrainingReviewPostV2E2ECoverageComplete()
  )
}