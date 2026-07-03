/** Cierre global historial v2 pulido entrenamiento oleada 452. */

export type TrainingPolishWorkoutHistoryV2GlobalCover = 'history' | 'pr' | 'inventory' | 'e2e' | 'closure'

export type TrainingPolishWorkoutHistoryV2GlobalEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPolishWorkoutHistoryV2GlobalCover[]
}

export const TRAINING_POLISH_WORKOUT_HISTORY_V2_GLOBAL_UTILS: readonly TrainingPolishWorkoutHistoryV2GlobalEntry[] =
  [
    {
      id: 'history-v2-global-closure',
      module: 'trainingWorkoutHistoryV2GlobalClosure',
      oleada: 452,
      covers: ['history', 'pr', 'inventory', 'closure', 'e2e'],
    },
    {
      id: 'history-v2-global-e2e',
      module: 'e2eWorkoutHistoryV2GlobalCoverage',
      oleada: 452,
      covers: ['history', 'pr', 'inventory', 'closure', 'e2e'],
    },
  ] as const

export const TRAINING_POLISH_WORKOUT_HISTORY_V2_GLOBAL_CLOSED_OLEADA = 452

export function trainingPolishWorkoutHistoryV2GlobalRange(): { from: number; to: number } {
  return { from: 452, to: 452 }
}

export function countTrainingPolishWorkoutHistoryV2GlobalUtils(): number {
  return TRAINING_POLISH_WORKOUT_HISTORY_V2_GLOBAL_UTILS.length
}

export function isTrainingPolishWorkoutHistoryV2GlobalClosed(
  oleada = TRAINING_POLISH_WORKOUT_HISTORY_V2_GLOBAL_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_WORKOUT_HISTORY_V2_GLOBAL_CLOSED_OLEADA
}