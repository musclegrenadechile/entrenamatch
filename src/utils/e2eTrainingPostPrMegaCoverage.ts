/** Registro E2E union mega post-PR — 9 specs oleadas 436–452 (oleada 452). */
import { E2E_TRAINING_FULL_FLOW_PR_SPECS } from './e2eTrainingFullFlowPrCoverage'
import { E2E_TRAINING_MEGA_FLOW_PR_SPECS } from './e2eTrainingMegaFlowPrCoverage'
import { E2E_TRAINING_REVIEW_PR_SPECS } from './e2eTrainingReviewPrCoverage'
import { E2E_TRAINING_PR_V2_SPECS } from './e2eTrainingPrV2Coverage'
import { E2E_WORKOUT_HISTORY_SPARKLINE_PR_SPECS } from './e2eWorkoutHistorySparklinePrCoverage'
import { isTrainingFullFlowPrCoverageComplete } from './e2eTrainingFullFlowPrCoverage'
import { isTrainingMegaFlowPrCoverageComplete } from './e2eTrainingMegaFlowPrCoverage'
import { isTrainingPrV2CoverageComplete } from './e2eTrainingPrV2Coverage'
import { isTrainingReviewPrCoverageComplete } from './e2eTrainingReviewPrCoverage'
import { isWorkoutHistorySparklinePrCoverageComplete } from './e2eWorkoutHistorySparklinePrCoverage'

export type E2ETrainingPostPrMegaCover =
  | 'session-pr-tone'
  | 'fab-session-pr-tone'
  | 'banner-pr-tone'
  | 'fuel-prefill-pr-tone'
  | 'history-row-pr-tone'
  | 'review-pr-tone'
  | 'sparkline-pr-tone'
  | 'full-flow-review-pr'
  | 'mega-flow-review-pr'
  | 'harness'
  | 'aria'

export type E2ETrainingPostPrMegaSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2ETrainingPostPrMegaCover[]
}

export const E2E_TRAINING_POST_PR_MEGA_SPECS: readonly E2ETrainingPostPrMegaSpecEntry[] = [
  ...E2E_TRAINING_PR_V2_SPECS,
  ...E2E_TRAINING_REVIEW_PR_SPECS,
  ...E2E_WORKOUT_HISTORY_SPARKLINE_PR_SPECS,
  ...E2E_TRAINING_FULL_FLOW_PR_SPECS,
  ...E2E_TRAINING_MEGA_FLOW_PR_SPECS,
] as const

const POST_PR_MEGA_TONE_COVERS = [
  'session-pr-tone',
  'fab-session-pr-tone',
  'banner-pr-tone',
  'fuel-prefill-pr-tone',
  'history-row-pr-tone',
  'review-pr-tone',
  'sparkline-pr-tone',
  'full-flow-review-pr',
  'mega-flow-review-pr',
] as const

export function countE2ETrainingPostPrMegaSpecs(): number {
  return E2E_TRAINING_POST_PR_MEGA_SPECS.length
}

export function unionTrainingPostPrMegaCovers(): E2ETrainingPostPrMegaCover[] {
  const all = new Set<E2ETrainingPostPrMegaCover>()
  for (const spec of E2E_TRAINING_POST_PR_MEGA_SPECS) {
    for (const cover of spec.covers) all.add(cover)
  }
  return [...all]
}

export function trainingPostPrMegaSpecFileBasenames(): string[] {
  return E2E_TRAINING_POST_PR_MEGA_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}

export function e2eTrainingPostPrMegaBlockRange(): { from: number; to: number } {
  return { from: 436, to: 452 }
}

export function isTrainingPostPrMegaCoverageComplete(): boolean {
  const covers = unionTrainingPostPrMegaCovers()
  return (
    isTrainingPrV2CoverageComplete() &&
    isTrainingReviewPrCoverageComplete() &&
    isWorkoutHistorySparklinePrCoverageComplete() &&
    isTrainingFullFlowPrCoverageComplete() &&
    isTrainingMegaFlowPrCoverageComplete() &&
    POST_PR_MEGA_TONE_COVERS.every((c) => covers.includes(c))
  )
}