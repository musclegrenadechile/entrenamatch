/** Pulido post-entreno v2 post-gym-log-v2 oleada 439+. */

export type TrainingPolishPostWorkoutV2Cover =
  | 'banner'
  | 'fuel-prefill'
  | 'pr'
  | 'aria'
  | 'e2e'

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
    {
      id: 'fuel-prefill-pr-tone',
      module: 'fuelLogPrefillPrToneDisplay',
      oleada: 441,
      covers: ['fuel-prefill', 'pr', 'aria', 'e2e'],
    },
    {
      id: 'post-v2-closure',
      module: 'e2ePostWorkoutPostV2Coverage',
      oleada: 442,
      covers: ['banner', 'fuel-prefill', 'pr', 'aria', 'e2e'],
    },
  ] as const

export const TRAINING_POLISH_POST_WORKOUT_V2_OPEN_OLEADA = 439
export const TRAINING_POLISH_POST_WORKOUT_V2_CLOSED_OLEADA = 442

export function trainingPolishPostWorkoutV2Range(): { from: number; to: number } {
  return { from: 439, to: 442 }
}

export function countTrainingPolishPostWorkoutV2Utils(): number {
  return TRAINING_POLISH_POST_WORKOUT_V2_UTILS.length
}

export function isTrainingPolishPostWorkoutV2Open(
  oleada = TRAINING_POLISH_POST_WORKOUT_V2_OPEN_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_POST_WORKOUT_V2_OPEN_OLEADA
}

export function isTrainingPolishPostWorkoutV2Closed(
  oleada = TRAINING_POLISH_POST_WORKOUT_V2_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_POST_WORKOUT_V2_CLOSED_OLEADA
}