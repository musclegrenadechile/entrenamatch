/** Inventario E2E mega post-PR full v2 — 7 suites (oleada 454). */
import { isTrainingFullFlowPrCoverageComplete } from './e2eTrainingFullFlowPrCoverage'
import { isTrainingMegaFlowPrCoverageComplete } from './e2eTrainingMegaFlowPrCoverage'
import { isTrainingPostPrMegaCoverageComplete } from './e2eTrainingPostPrMegaCoverage'
import { isTrainingPostPrMegaPostV2E2ECoverageComplete } from './e2eTrainingPostPrMegaPostV2Coverage'
import { isTrainingPrV2FullE2ECoverageComplete } from './e2eTrainingPrV2FullCoverage'
import { isTrainingReviewFullE2ECoverageComplete } from './e2eTrainingReviewFullCoverage'
import { isWorkoutHistoryV2GlobalFullE2ECoverageComplete } from './e2eWorkoutHistoryV2GlobalFullCoverage'
import { isTrainingPostPrMegaFullE2ECoverageComplete } from './e2eTrainingPostPrMegaFullCoverage'

export const TRAINING_POST_PR_MEGA_FULL_V2_COVERAGE_MODULES = [
  'e2eTrainingPrV2FullCoverage',
  'e2eTrainingPostPrMegaCoverage',
  'e2eTrainingReviewFullCoverage',
  'e2eWorkoutHistoryV2GlobalFullCoverage',
  'e2eTrainingFullFlowPrCoverage',
  'e2eTrainingPostPrMegaPostV2Coverage',
  'e2eTrainingPostPrMegaFullCoverage',
] as const

export type TrainingPostPrMegaFullV2CoverageModule =
  (typeof TRAINING_POST_PR_MEGA_FULL_V2_COVERAGE_MODULES)[number]

export function countTrainingPostPrMegaFullV2CoverageSuites(): number {
  return TRAINING_POST_PR_MEGA_FULL_V2_COVERAGE_MODULES.length
}

export function e2eTrainingPostPrMegaFullV2BlockRange(): { from: number; to: number } {
  return { from: 436, to: 454 }
}

export function isTrainingPostPrMegaFullV2E2ECoverageComplete(): boolean {
  return (
    isTrainingPostPrMegaFullE2ECoverageComplete() &&
    isTrainingPrV2FullE2ECoverageComplete() &&
    isTrainingReviewFullE2ECoverageComplete() &&
    isWorkoutHistoryV2GlobalFullE2ECoverageComplete() &&
    isTrainingFullFlowPrCoverageComplete() &&
    isTrainingMegaFlowPrCoverageComplete() &&
    isTrainingPostPrMegaCoverageComplete() &&
    isTrainingPostPrMegaPostV2E2ECoverageComplete()
  )
}