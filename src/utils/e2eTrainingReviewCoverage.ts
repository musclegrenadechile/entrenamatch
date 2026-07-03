/** Registro E2E reseña v2 — union de spec review-pr (oleada 446). */
import { E2E_TRAINING_REVIEW_PR_SPECS } from './e2eTrainingReviewPrCoverage'

export type E2ETrainingReviewCover = 'review-pr-tone' | 'harness' | 'aria'

export type E2ETrainingReviewSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2ETrainingReviewCover[]
}

export const E2E_TRAINING_REVIEW_SPECS: readonly E2ETrainingReviewSpecEntry[] = [
  ...E2E_TRAINING_REVIEW_PR_SPECS,
] as const

export function countE2ETrainingReviewSpecs(): number {
  return E2E_TRAINING_REVIEW_SPECS.length
}

export function unionTrainingReviewCovers(): E2ETrainingReviewCover[] {
  const all = new Set<E2ETrainingReviewCover>()
  for (const spec of E2E_TRAINING_REVIEW_SPECS) {
    for (const cover of spec.covers) all.add(cover)
  }
  return [...all]
}

export function trainingReviewSpecFileBasenames(): string[] {
  return E2E_TRAINING_REVIEW_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}