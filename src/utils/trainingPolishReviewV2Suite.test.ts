import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishReviewV2Utils,
  isTrainingPolishReviewV2Open,
  TRAINING_POLISH_REVIEW_V2_OPEN_OLEADA,
  TRAINING_POLISH_REVIEW_V2_UTILS,
  trainingPolishReviewV2Range,
} from './trainingPolishReviewV2Suite'

describe('trainingPolishReviewV2Suite', () => {
  it('inventario reseña v2 oleada 445', () => {
    expect(countTrainingPolishReviewV2Utils()).toBe(1)
    expect(TRAINING_POLISH_REVIEW_V2_UTILS[0].module).toBe('trainingReviewPrToneDisplay')
    expect(TRAINING_POLISH_REVIEW_V2_UTILS[0].oleada).toBe(445)
  })

  it('rango y apertura oleada 445', () => {
    expect(trainingPolishReviewV2Range()).toEqual({ from: 445, to: 445 })
    expect(TRAINING_POLISH_REVIEW_V2_OPEN_OLEADA).toBe(445)
    expect(isTrainingPolishReviewV2Open(445)).toBe(true)
    expect(isTrainingPolishReviewV2Open(444)).toBe(false)
  })
})