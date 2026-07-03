import { describe, expect, it } from 'vitest'
import {
  buildTrainingReviewPrToneAriaLabel,
  resolveTrainingReviewPrToneClass,
  REVIEW_MODAL_PR_TONE_CLASS,
  reviewPrAriaMatchesPr,
} from './trainingReviewPrToneDisplay'

describe('trainingReviewPrToneDisplay', () => {
  it('resolveTrainingReviewPrToneClass', () => {
    expect(resolveTrainingReviewPrToneClass(true)).toBe(REVIEW_MODAL_PR_TONE_CLASS)
    expect(resolveTrainingReviewPrToneClass(false)).toBeNull()
  })

  it('buildTrainingReviewPrToneAriaLabel y reviewPrAriaMatchesPr', () => {
    const aria = buildTrainingReviewPrToneAriaLabel('Ana', true)
    expect(aria).toMatch(/récord personal/)
    expect(aria).toMatch(/Ana/)
    expect(reviewPrAriaMatchesPr(aria)).toBe(true)
    expect(reviewPrAriaMatchesPr('Reseña post-entreno: ¿Cómo fue entrenar con Ana?')).toBe(false)
  })
})