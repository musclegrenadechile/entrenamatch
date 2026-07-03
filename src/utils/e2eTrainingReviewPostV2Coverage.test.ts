import { describe, expect, it } from 'vitest'
import {
  countTrainingReviewPostV2CoverageModules,
  e2eTrainingReviewPostV2BlockRange,
  isTrainingReviewPostV2E2ECoverageComplete,
  TRAINING_REVIEW_POST_V2_COVERAGE_MODULES,
} from './e2eTrainingReviewPostV2Coverage'

describe('e2eTrainingReviewPostV2Coverage', () => {
  it('inventario cierre reseña v2 oleada 446', () => {
    expect(countTrainingReviewPostV2CoverageModules()).toBe(2)
    expect(TRAINING_REVIEW_POST_V2_COVERAGE_MODULES).toEqual([
      'trainingReviewPrToneDisplay',
      'e2eTrainingReviewPrCoverage',
    ])
  })

  it('bloque 445–446 y cobertura completa', () => {
    expect(e2eTrainingReviewPostV2BlockRange()).toEqual({ from: 445, to: 446 })
    expect(isTrainingReviewPostV2E2ECoverageComplete()).toBe(true)
  })
})