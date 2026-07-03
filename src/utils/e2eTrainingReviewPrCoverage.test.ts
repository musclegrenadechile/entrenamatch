import { describe, expect, it } from 'vitest'
import {
  countE2ETrainingReviewPrSpecs,
  e2eTrainingReviewPrBlockRange,
  E2E_TRAINING_REVIEW_PR_SPECS,
  isTrainingReviewPrCoverageComplete,
  trainingReviewPrSpecFileBasenames,
} from './e2eTrainingReviewPrCoverage'

describe('e2eTrainingReviewPrCoverage', () => {
  it('inventario 1 spec workout-flow oleada 445', () => {
    expect(countE2ETrainingReviewPrSpecs()).toBe(1)
    expect(E2E_TRAINING_REVIEW_PR_SPECS[0].id).toBe('workout-flow')
    expect(E2E_TRAINING_REVIEW_PR_SPECS[0].oleada).toBe(445)
    expect(trainingReviewPrSpecFileBasenames()).toEqual(['workout-flow.spec.ts'])
  })

  it('bloque oleada 445 y cobertura completa', () => {
    expect(e2eTrainingReviewPrBlockRange()).toEqual({ from: 445, to: 445 })
    expect(isTrainingReviewPrCoverageComplete()).toBe(true)
  })
})