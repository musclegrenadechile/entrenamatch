import { describe, expect, it } from 'vitest'
import {
  countTrainingReviewCoverageSuites,
  e2eTrainingReviewFullBlockRange,
  isTrainingReviewFullE2ECoverageComplete,
  TRAINING_REVIEW_FULL_COVERAGE_MODULES,
} from './e2eTrainingReviewFullCoverage'

describe('e2eTrainingReviewFullCoverage', () => {
  it('inventario 2 suites reseña v2 oleada 446', () => {
    expect(countTrainingReviewCoverageSuites()).toBe(2)
    expect(TRAINING_REVIEW_FULL_COVERAGE_MODULES).toEqual([
      'e2eTrainingReviewPrCoverage',
      'e2eTrainingReviewPostV2Coverage',
    ])
  })

  it('bloque 445–446 y cobertura completa', () => {
    expect(e2eTrainingReviewFullBlockRange()).toEqual({ from: 445, to: 446 })
    expect(isTrainingReviewFullE2ECoverageComplete()).toBe(true)
  })
})