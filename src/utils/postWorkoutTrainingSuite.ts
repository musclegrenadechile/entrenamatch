/** Inventario del bloque post-entreno (oleadas 390–394). */
export type PostWorkoutTrainingCover = 'review' | 'banner' | 'fuel-banner' | 'fuel-prefill' | 'pr'

export type PostWorkoutTrainingUtilEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly PostWorkoutTrainingCover[]
}

export const POST_WORKOUT_TRAINING_UTILS: readonly PostWorkoutTrainingUtilEntry[] = [
  {
    id: 'review-display',
    module: 'trainingReviewDisplay',
    oleada: 390,
    covers: ['review', 'banner'],
  },
  {
    id: 'save-banner-e2e',
    module: 'workoutSaveBannerDisplay + e2eHarness',
    oleada: 391,
    covers: ['banner', 'review'],
  },
  {
    id: 'fuel-balance-banner',
    module: 'workoutSaveBannerDisplay',
    oleada: 392,
    covers: ['fuel-banner', 'banner'],
  },
  {
    id: 'fuel-prefill',
    module: 'fuelLogPrefill + FuelLogModal',
    oleada: 393,
    covers: ['fuel-prefill', 'fuel-banner'],
  },
  {
    id: 'post-workout-suite',
    module: 'postWorkoutTrainingSuite',
    oleada: 394,
    covers: ['review', 'banner', 'fuel-banner', 'fuel-prefill'],
  },
  {
    id: 'banner-pr-tone',
    module: 'workoutSaveBannerPrToneDisplay',
    oleada: 439,
    covers: ['banner', 'pr'],
  },
  {
    id: 'banner-pr-tone-e2e',
    module: 'e2eWorkoutSaveBannerPrCoverage',
    oleada: 439,
    covers: ['banner', 'pr'],
  },
  {
    id: 'post-workout-v2-open',
    module: 'trainingPolishPostWorkoutV2Suite',
    oleada: 439,
    covers: ['banner', 'pr'],
  },
] as const

export function countPostWorkoutTrainingUtils(): number {
  return POST_WORKOUT_TRAINING_UTILS.length
}

export function postWorkoutTrainingBlockRange(): { from: number; to: number } {
  return { from: 390, to: 439 }
}

export const POST_WORKOUT_TRAINING_V2_OPEN_OLEADA = 439