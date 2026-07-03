/** Pulido post-entreno v2 post-gym-log-v2 oleada 439+. */

export type TrainingPolishPostWorkoutV2Cover = 'banner' | 'pr' | 'aria' | 'e2e'

export type TrainingPolishPostWorkoutV2Entry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPolishPostWorkoutV2Cover[]
}

export const TRAINING_POLISH_POST_WORKOUT_V2_UTILS: readonly TrainingPolishPostWorkoutV2Entry[] =
  [
    {
      id: 'banner-pr-tone',
      module: 'workoutSaveBannerPrToneDisplay',
      oleada: 439,
      covers: ['banner', 'pr', 'aria', 'e2e'],
    },
  ] as const

export const TRAINING_POLISH_POST_WORKOUT_V2_OPEN_OLEADA = 439

export function trainingPolishPostWorkoutV2Range(): { from: number; to: number } {
  return { from: 439, to: 439 }
}

export function countTrainingPolishPostWorkoutV2Utils(): number {
  return TRAINING_POLISH_POST_WORKOUT_V2_UTILS.length
}

export function isTrainingPolishPostWorkoutV2Open(
  oleada = TRAINING_POLISH_POST_WORKOUT_V2_OPEN_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_POST_WORKOUT_V2_OPEN_OLEADA
}