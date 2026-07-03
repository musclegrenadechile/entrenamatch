import { describe, expect, it } from 'vitest'
import {
  countTrainingReviewV2TrainingUtils,
  TRAINING_REVIEW_V2_TRAINING_UTILS,
  trainingReviewV2TrainingBlockRange,
} from './trainingReviewV2TrainingSuite'

describe('trainingReviewV2TrainingSuite', () => {
  it('inventario reseña v2 oleadas 445–446', () => {
    expect(countTrainingReviewV2TrainingUtils()).toBe(6)
    expect(TRAINING_REVIEW_V2_TRAINING_UTILS.map((u) => u.oleada)).toEqual([
      445, 445, 445, 446, 446, 446,
    ])
    expect(TRAINING_REVIEW_V2_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eTrainingReviewCoverage'
    )
    expect(TRAINING_REVIEW_V2_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eTrainingReviewPostV2Coverage'
    )
    expect(TRAINING_REVIEW_V2_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eTrainingReviewFullCoverage'
    )
  })

  it('bloque oleadas 445–446', () => {
    expect(trainingReviewV2TrainingBlockRange()).toEqual({ from: 445, to: 446 })
  })
})