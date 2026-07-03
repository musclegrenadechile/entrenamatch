/** Inventario del bloque reseña v2 (oleadas 445–446). */
export type TrainingReviewV2TrainingCover = 'review' | 'pr' | 'e2e' | 'closure'

export type TrainingReviewV2TrainingUtilEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingReviewV2TrainingCover[]
}

export const TRAINING_REVIEW_V2_TRAINING_UTILS: readonly TrainingReviewV2TrainingUtilEntry[] = [
  {
    id: 'review-pr-tone',
    module: 'trainingReviewPrToneDisplay',
    oleada: 445,
    covers: ['review', 'pr'],
  },
  {
    id: 'review-pr-tone-e2e',
    module: 'e2eTrainingReviewPrCoverage',
    oleada: 445,
    covers: ['review', 'pr', 'e2e'],
  },
  {
    id: 'review-v2-open',
    module: 'trainingPolishReviewV2Suite',
    oleada: 445,
    covers: ['review', 'pr'],
  },
  {
    id: 'review-coverage',
    module: 'e2eTrainingReviewCoverage',
    oleada: 446,
    covers: ['review', 'pr', 'e2e'],
  },
  {
    id: 'post-v2-closure',
    module: 'e2eTrainingReviewPostV2Coverage',
    oleada: 446,
    covers: ['review', 'pr', 'e2e', 'closure'],
  },
  {
    id: 'review-full-coverage',
    module: 'e2eTrainingReviewFullCoverage',
    oleada: 446,
    covers: ['review', 'pr', 'e2e', 'closure'],
  },
] as const

export function countTrainingReviewV2TrainingUtils(): number {
  return TRAINING_REVIEW_V2_TRAINING_UTILS.length
}

export function trainingReviewV2TrainingBlockRange(): { from: number; to: number } {
  return { from: 445, to: 446 }
}