/** Inventario E2E cierre post-entreno v2 oleadas 439–442 (oleada 442). */
import { unionPostWorkoutCovers } from './e2ePostWorkoutCoverage'
import { isFuelLogPrefillPrCoverageComplete } from './e2eFuelLogPrefillPrCoverage'
import { isWorkoutSaveBannerPrCoverageComplete } from './e2eWorkoutSaveBannerPrCoverage'
import { isTrainingPolishPostWorkoutV2Closed } from './trainingPolishPostWorkoutV2Suite'

export const POST_WORKOUT_POST_V2_COVERAGE_MODULES = [
  'workoutSaveBannerPrToneDisplay',
  'fuelLogPrefillPrToneDisplay',
  'e2eWorkoutSaveBannerPrCoverage',
  'e2eFuelLogPrefillPrCoverage',
] as const

export type PostWorkoutPostV2CoverageModule =
  (typeof POST_WORKOUT_POST_V2_COVERAGE_MODULES)[number]

const POST_V2_COVERS = ['banner-pr-tone', 'fuel-prefill-pr-tone'] as const

export function countPostWorkoutPostV2CoverageModules(): number {
  return POST_WORKOUT_POST_V2_COVERAGE_MODULES.length
}

export function e2ePostWorkoutPostV2BlockRange(): { from: number; to: number } {
  return { from: 439, to: 442 }
}

export function isPostWorkoutPostV2E2ECoverageComplete(): boolean {
  const covers = unionPostWorkoutCovers()
  return (
    isTrainingPolishPostWorkoutV2Closed(442) &&
    isWorkoutSaveBannerPrCoverageComplete() &&
    isFuelLogPrefillPrCoverageComplete() &&
    POST_V2_COVERS.every((c) => covers.includes(c))
  )
}