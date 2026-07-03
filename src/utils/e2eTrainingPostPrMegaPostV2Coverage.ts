/** Inventario E2E cierre mega post-PR oleadas 451–452 (oleada 452). */
import { unionTrainingPostPrMegaCovers } from './e2eTrainingPostPrMegaCoverage'
import { isTrainingMegaFlowPrCoverageComplete } from './e2eTrainingMegaFlowPrCoverage'
import { isTrainingPostPrMegaCoverageComplete } from './e2eTrainingPostPrMegaCoverage'
import { isTrainingPolishPostPrMegaClosed } from './trainingPolishPostPrMegaSuite'

export const TRAINING_POST_PR_MEGA_POST_V2_COVERAGE_MODULES = [
  'e2eTrainingPostPrMegaCoverage',
  'e2eTrainingMegaFlowPrCoverage',
] as const

export type TrainingPostPrMegaPostV2CoverageModule =
  (typeof TRAINING_POST_PR_MEGA_POST_V2_COVERAGE_MODULES)[number]

const POST_V2_COVERS = ['mega-flow-review-pr'] as const

export function countTrainingPostPrMegaPostV2CoverageModules(): number {
  return TRAINING_POST_PR_MEGA_POST_V2_COVERAGE_MODULES.length
}

export function e2eTrainingPostPrMegaPostV2BlockRange(): { from: number; to: number } {
  return { from: 451, to: 452 }
}

export function isTrainingPostPrMegaPostV2E2ECoverageComplete(): boolean {
  const covers = unionTrainingPostPrMegaCovers()
  return (
    isTrainingPolishPostPrMegaClosed(452) &&
    isTrainingPostPrMegaCoverageComplete() &&
    isTrainingMegaFlowPrCoverageComplete() &&
    POST_V2_COVERS.every((c) => covers.includes(c))
  )
}