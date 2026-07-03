/** Inventario E2E cierre reseña v2 oleadas 445–446 (oleada 446). */
import { unionTrainingReviewCovers } from './e2eTrainingReviewCoverage'
import { isTrainingReviewPrCoverageComplete } from './e2eTrainingReviewPrCoverage'
import { isTrainingPolishReviewV2Closed } from './trainingPolishReviewV2Suite'

export const TRAINING_REVIEW_POST_V2_COVERAGE_MODULES = [
  'trainingReviewPrToneDisplay',
  'e2eTrainingReviewPrCoverage',
] as const

export type TrainingReviewPostV2CoverageModule =
  (typeof TRAINING_REVIEW_POST_V2_COVERAGE_MODULES)[number]

const POST_V2_COVERS = ['review-pr-tone'] as const

export function countTrainingReviewPostV2CoverageModules(): number {
  return TRAINING_REVIEW_POST_V2_COVERAGE_MODULES.length
}

export function e2eTrainingReviewPostV2BlockRange(): { from: number; to: number } {
  return { from: 445, to: 446 }
}

export function isTrainingReviewPostV2E2ECoverageComplete(): boolean {
  const covers = unionTrainingReviewCovers()
  return (
    isTrainingPolishReviewV2Closed(446) &&
    isTrainingReviewPrCoverageComplete() &&
    POST_V2_COVERS.every((c) => covers.includes(c))
  )
}