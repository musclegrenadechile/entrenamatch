/** Inventario E2E post-entreno v2 completo — 3 suites (oleada 442). */
import { isFuelLogPrefillPrCoverageComplete } from './e2eFuelLogPrefillPrCoverage'
import { isPostWorkoutPostV2E2ECoverageComplete } from './e2ePostWorkoutPostV2Coverage'
import { unionPostWorkoutCovers } from './e2ePostWorkoutCoverage'
import { isWorkoutSaveBannerPrCoverageComplete } from './e2eWorkoutSaveBannerPrCoverage'
import { isTrainingPolishPostWorkoutV2Closed } from './trainingPolishPostWorkoutV2Suite'

export const POST_WORKOUT_FULL_COVERAGE_MODULES = [
  'e2eWorkoutSaveBannerPrCoverage',
  'e2eFuelLogPrefillPrCoverage',
  'e2ePostWorkoutPostV2Coverage',
] as const

export type PostWorkoutFullCoverageModule = (typeof POST_WORKOUT_FULL_COVERAGE_MODULES)[number]

export function countPostWorkoutCoverageSuites(): number {
  return POST_WORKOUT_FULL_COVERAGE_MODULES.length
}

export function e2ePostWorkoutFullBlockRange(): { from: number; to: number } {
  return { from: 439, to: 442 }
}

export function isPostWorkoutFullE2ECoverageComplete(): boolean {
  return (
    isWorkoutSaveBannerPrCoverageComplete() &&
    isFuelLogPrefillPrCoverageComplete() &&
    isTrainingPolishPostWorkoutV2Closed(442) &&
    unionPostWorkoutCovers().includes('banner-pr-tone') &&
    unionPostWorkoutCovers().includes('fuel-prefill-pr-tone') &&
    isPostWorkoutPostV2E2ECoverageComplete()
  )
}