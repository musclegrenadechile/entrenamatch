import { describe, expect, it } from 'vitest'
import {
  countE2ETrainingReviewSpecs,
  E2E_TRAINING_REVIEW_SPECS,
  trainingReviewSpecFileBasenames,
  unionTrainingReviewCovers,
} from './e2eTrainingReviewCoverage'

describe('e2eTrainingReviewCoverage', () => {
  it('union reseña v2 specs oleada 445', () => {
    expect(countE2ETrainingReviewSpecs()).toBe(1)
    expect(E2E_TRAINING_REVIEW_SPECS.map((s) => s.id)).toEqual(['workout-flow'])
    expect(unionTrainingReviewCovers().sort()).toEqual(
      ['aria', 'harness', 'review-pr-tone'].sort()
    )
    expect(trainingReviewSpecFileBasenames()).toEqual(['workout-flow.spec.ts'])
  })
})