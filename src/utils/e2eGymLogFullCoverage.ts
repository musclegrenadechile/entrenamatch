/** Inventario E2E gym-log v2 completo — 3 suites (oleada 438). */
import { isGymLogFabSessionPrCoverageComplete } from './e2eGymLogFabSessionPrCoverage'
import { isGymLogPostV2E2ECoverageComplete } from './e2eGymLogPostV2Coverage'
import { isGymLogSessionPrCoverageComplete } from './e2eGymLogSessionPrCoverage'
import { unionGymLogCovers } from './e2eGymLogCoverage'
import { isTrainingPolishGymLogV2Closed } from './trainingPolishGymLogV2Suite'

export const GYM_LOG_FULL_COVERAGE_MODULES = [
  'e2eGymLogSessionPrCoverage',
  'e2eGymLogFabSessionPrCoverage',
  'e2eGymLogPostV2Coverage',
] as const

export type GymLogFullCoverageModule = (typeof GYM_LOG_FULL_COVERAGE_MODULES)[number]

export function countGymLogCoverageSuites(): number {
  return GYM_LOG_FULL_COVERAGE_MODULES.length
}

export function e2eGymLogFullBlockRange(): { from: number; to: number } {
  return { from: 436, to: 438 }
}

export function isGymLogFullE2ECoverageComplete(): boolean {
  return (
    isGymLogSessionPrCoverageComplete() &&
    isGymLogFabSessionPrCoverageComplete() &&
    isTrainingPolishGymLogV2Closed(438) &&
    unionGymLogCovers().includes('session-pr-tone') &&
    unionGymLogCovers().includes('fab-session-pr-tone') &&
    isGymLogPostV2E2ECoverageComplete()
  )
}