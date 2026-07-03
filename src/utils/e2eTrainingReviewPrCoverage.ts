/** Inventario E2E tono PR×reseña post-entreno — 1 spec (oleada 445). */

export type E2ETrainingReviewPrCover = 'review-pr-tone' | 'harness' | 'aria'

export type E2ETrainingReviewPrSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2ETrainingReviewPrCover[]
}

export const E2E_TRAINING_REVIEW_PR_SPECS: readonly E2ETrainingReviewPrSpecEntry[] = [
  {
    id: 'workout-flow',
    file: 'e2e/workout-flow.spec.ts',
    oleada: 445,
    covers: ['review-pr-tone', 'harness', 'aria'],
  },
] as const

export function countE2ETrainingReviewPrSpecs(): number {
  return E2E_TRAINING_REVIEW_PR_SPECS.length
}

export function e2eTrainingReviewPrBlockRange(): { from: number; to: number } {
  return { from: 445, to: 445 }
}

export function isTrainingReviewPrCoverageComplete(): boolean {
  return E2E_TRAINING_REVIEW_PR_SPECS.every((s) => s.covers.includes('review-pr-tone'))
}

export function trainingReviewPrSpecFileBasenames(): string[] {
  return E2E_TRAINING_REVIEW_PR_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}