import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearReviewSessionPr,
  deriveReviewSessionHasPr,
  persistReviewSessionPr,
  resetReviewSessionPrForTests,
  resolveTrainingReviewModalHasPr,
  resolveTrainingReviewModalHasPrFromBanner,
} from './trainingReviewSessionPr'

describe('trainingReviewSessionPr', () => {
  beforeEach(() => {
    resetReviewSessionPrForTests()
  })

  it('deriveReviewSessionHasPr', () => {
    expect(deriveReviewSessionHasPr(undefined)).toBe(false)
    expect(deriveReviewSessionHasPr('')).toBe(false)
    expect(deriveReviewSessionHasPr('🏆 Nuevo PR')).toBe(true)
  })

  it('resolveTrainingReviewModalHasPr banner o sesión (oleada 450)', () => {
    expect(resolveTrainingReviewModalHasPr(undefined, false)).toBe(false)
    expect(resolveTrainingReviewModalHasPr('🏆 Nuevo PR', false)).toBe(true)
    expect(resolveTrainingReviewModalHasPr(undefined, true)).toBe(true)
  })

  it('persistReviewSessionPr sobrevive dismiss banner', () => {
    persistReviewSessionPr('🏆 Nuevo PR')
    expect(resolveTrainingReviewModalHasPrFromBanner(undefined)).toBe(true)
    clearReviewSessionPr()
    expect(resolveTrainingReviewModalHasPrFromBanner(undefined)).toBe(false)
  })
})