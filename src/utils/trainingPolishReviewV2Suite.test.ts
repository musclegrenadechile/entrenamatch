import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishReviewV2Utils,
  isTrainingPolishReviewV2Closed,
  isTrainingPolishReviewV2Open,
  TRAINING_POLISH_REVIEW_V2_CLOSED_OLEADA,
  TRAINING_POLISH_REVIEW_V2_OPEN_OLEADA,
  TRAINING_POLISH_REVIEW_V2_UTILS,
  trainingPolishReviewV2Range,
} from './trainingPolishReviewV2Suite'

describe('trainingPolishReviewV2Suite', () => {
  it('inventario reseña v2 oleadas 445–446', () => {
    expect(countTrainingPolishReviewV2Utils()).toBe(2)
    expect(TRAINING_POLISH_REVIEW_V2_UTILS.map((u) => u.oleada)).toEqual([445, 446])
    expect(TRAINING_POLISH_REVIEW_V2_UTILS.map((u) => u.module)).toContain(
      'e2eTrainingReviewPostV2Coverage'
    )
  })

  it('rango, apertura y cierre oleadas 445–446', () => {
    expect(trainingPolishReviewV2Range()).toEqual({ from: 445, to: 446 })
    expect(TRAINING_POLISH_REVIEW_V2_OPEN_OLEADA).toBe(445)
    expect(TRAINING_POLISH_REVIEW_V2_CLOSED_OLEADA).toBe(446)
    expect(isTrainingPolishReviewV2Open(445)).toBe(true)
    expect(isTrainingPolishReviewV2Open(444)).toBe(false)
    expect(isTrainingPolishReviewV2Closed(446)).toBe(true)
    expect(isTrainingPolishReviewV2Closed(445)).toBe(false)
  })
})