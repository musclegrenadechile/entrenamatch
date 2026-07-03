import { describe, expect, it } from 'vitest'
import { buildTrainingReviewRatingHint, canSubmitTrainingReview } from './trainingReviewDisplay'

describe('trainingReviewDisplay', () => {
  it('buildTrainingReviewRatingHint por rating', () => {
    expect(buildTrainingReviewRatingHint(0)).toContain('estrellas')
    expect(buildTrainingReviewRatingHint(2)).toContain('mejorar')
    expect(buildTrainingReviewRatingHint(3)).toContain('correcta')
    expect(buildTrainingReviewRatingHint(5)).toContain('Buen match')
  })

  it('canSubmitTrainingReview', () => {
    expect(canSubmitTrainingReview(0)).toBe(false)
    expect(canSubmitTrainingReview(3)).toBe(true)
    expect(canSubmitTrainingReview(6)).toBe(false)
  })
})