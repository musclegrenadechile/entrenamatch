/** Pulido historial v2 post-post-entreno-v2 oleada 440+. */

export type TrainingPolishWorkoutHistoryV2Cover = 'history' | 'pr' | 'aria' | 'e2e'

export type TrainingPolishWorkoutHistoryV2Entry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPolishWorkoutHistoryV2Cover[]
}

export const TRAINING_POLISH_WORKOUT_HISTORY_V2_UTILS: readonly TrainingPolishWorkoutHistoryV2Entry[] =
  [
    {
      id: 'history-row-pr-tone',
      module: 'workoutHistoryRowPrToneDisplay',
      oleada: 440,
      covers: ['history', 'pr', 'aria', 'e2e'],
    },
    {
      id: 'post-v2-closure',
      module: 'e2eWorkoutHistoryPostV2Coverage',
      oleada: 443,
      covers: ['history', 'pr', 'aria', 'e2e'],
    },
  ] as const

export const TRAINING_POLISH_WORKOUT_HISTORY_V2_OPEN_OLEADA = 440
export const TRAINING_POLISH_WORKOUT_HISTORY_V2_CLOSED_OLEADA = 443

export function trainingPolishWorkoutHistoryV2Range(): { from: number; to: number } {
  return { from: 440, to: 443 }
}

export function countTrainingPolishWorkoutHistoryV2Utils(): number {
  return TRAINING_POLISH_WORKOUT_HISTORY_V2_UTILS.length
}

export function isTrainingPolishWorkoutHistoryV2Open(
  oleada = TRAINING_POLISH_WORKOUT_HISTORY_V2_OPEN_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_WORKOUT_HISTORY_V2_OPEN_OLEADA
}

export function isTrainingPolishWorkoutHistoryV2Closed(
  oleada = TRAINING_POLISH_WORKOUT_HISTORY_V2_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_WORKOUT_HISTORY_V2_CLOSED_OLEADA
}