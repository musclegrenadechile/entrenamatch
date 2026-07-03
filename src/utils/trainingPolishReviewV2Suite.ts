/** Pulido reseña v2 post-PR v2 global oleada 445+. */

export type TrainingPolishReviewV2Cover = 'review' | 'pr' | 'aria' | 'e2e'

export type TrainingPolishReviewV2Entry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPolishReviewV2Cover[]
}

export const TRAINING_POLISH_REVIEW_V2_UTILS: readonly TrainingPolishReviewV2Entry[] = [
  {
    id: 'review-pr-tone',
    module: 'trainingReviewPrToneDisplay',
    oleada: 445,
    covers: ['review', 'pr', 'aria', 'e2e'],
  },
  {
    id: 'post-v2-closure',
    module: 'e2eTrainingReviewPostV2Coverage',
    oleada: 446,
    covers: ['review', 'pr', 'aria', 'e2e'],
  },
] as const

export const TRAINING_POLISH_REVIEW_V2_OPEN_OLEADA = 445
export const TRAINING_POLISH_REVIEW_V2_CLOSED_OLEADA = 446

export function trainingPolishReviewV2Range(): { from: number; to: number } {
  return { from: 445, to: 446 }
}

export function countTrainingPolishReviewV2Utils(): number {
  return TRAINING_POLISH_REVIEW_V2_UTILS.length
}

export function isTrainingPolishReviewV2Open(
  oleada = TRAINING_POLISH_REVIEW_V2_OPEN_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_REVIEW_V2_OPEN_OLEADA
}

export function isTrainingPolishReviewV2Closed(
  oleada = TRAINING_POLISH_REVIEW_V2_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_REVIEW_V2_CLOSED_OLEADA
}