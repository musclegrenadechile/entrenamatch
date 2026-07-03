/** Inventario E2E cierre gym-log v2 oleadas 436–438 (oleada 438). */
import { unionGymLogCovers } from './e2eGymLogCoverage'
import { isGymLogFabSessionPrCoverageComplete } from './e2eGymLogFabSessionPrCoverage'
import { isGymLogSessionPrCoverageComplete } from './e2eGymLogSessionPrCoverage'
import { isTrainingPolishGymLogV2Closed } from './trainingPolishGymLogV2Suite'

export const GYM_LOG_POST_V2_COVERAGE_MODULES = [
  'gymLogSessionPrToneDisplay',
  'gymLogFabSessionPrToneDisplay',
  'e2eGymLogSessionPrCoverage',
  'e2eGymLogFabSessionPrCoverage',
] as const

export type GymLogPostV2CoverageModule = (typeof GYM_LOG_POST_V2_COVERAGE_MODULES)[number]

const POST_V2_COVERS = ['session-pr-tone', 'fab-session-pr-tone'] as const

export function countGymLogPostV2CoverageModules(): number {
  return GYM_LOG_POST_V2_COVERAGE_MODULES.length
}

export function e2eGymLogPostV2BlockRange(): { from: number; to: number } {
  return { from: 436, to: 438 }
}

export function isGymLogPostV2E2ECoverageComplete(): boolean {
  const covers = unionGymLogCovers()
  return (
    isTrainingPolishGymLogV2Closed(438) &&
    isGymLogSessionPrCoverageComplete() &&
    isGymLogFabSessionPrCoverageComplete() &&
    POST_V2_COVERS.every((c) => covers.includes(c))
  )
}