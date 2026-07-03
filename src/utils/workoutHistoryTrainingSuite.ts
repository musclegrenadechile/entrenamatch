/** Inventario del bloque historial entreno (oleadas 395–397). */
export type WorkoutHistoryTrainingCover = 'summary' | 'badges' | 'sparkline' | 'a11y'

export type WorkoutHistoryTrainingUtilEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly WorkoutHistoryTrainingCover[]
}

export const WORKOUT_HISTORY_TRAINING_UTILS: readonly WorkoutHistoryTrainingUtilEntry[] = [
  {
    id: 'history-display',
    module: 'workoutHistoryDisplay',
    oleada: 395,
    covers: ['summary', 'badges'],
  },
  {
    id: 'history-badges',
    module: 'workoutHistoryBadges',
    oleada: 395,
    covers: ['badges'],
  },
  {
    id: 'sparkline-pr',
    module: 'workoutHistorySparkline',
    oleada: 396,
    covers: ['sparkline'],
  },
  {
    id: 'history-suite',
    module: 'workoutHistoryTrainingSuite',
    oleada: 397,
    covers: ['summary', 'badges', 'sparkline', 'a11y'],
  },
  {
    id: 'history-row-pr-tone',
    module: 'workoutHistoryRowPrToneDisplay',
    oleada: 440,
    covers: ['summary', 'badges', 'a11y'],
  },
  {
    id: 'history-row-pr-tone-e2e',
    module: 'e2eWorkoutHistoryRowPrCoverage',
    oleada: 440,
    covers: ['summary', 'badges', 'a11y'],
  },
  {
    id: 'history-v2-open',
    module: 'trainingPolishWorkoutHistoryV2Suite',
    oleada: 440,
    covers: ['summary', 'badges', 'a11y'],
  },
  {
    id: 'history-coverage',
    module: 'e2eWorkoutHistoryCoverage',
    oleada: 443,
    covers: ['summary', 'badges', 'a11y'],
  },
  {
    id: 'post-v2-closure',
    module: 'e2eWorkoutHistoryPostV2Coverage',
    oleada: 443,
    covers: ['summary', 'badges', 'a11y'],
  },
  {
    id: 'history-full-coverage',
    module: 'e2eWorkoutHistoryFullCoverage',
    oleada: 443,
    covers: ['summary', 'badges', 'a11y'],
  },
  {
    id: 'sparkline-pr-tone',
    module: 'workoutHistorySparklinePrToneDisplay',
    oleada: 448,
    covers: ['sparkline', 'a11y'],
  },
  {
    id: 'sparkline-pr-tone-e2e',
    module: 'e2eWorkoutHistorySparklinePrCoverage',
    oleada: 448,
    covers: ['sparkline', 'a11y'],
  },
] as const

export function countWorkoutHistoryTrainingUtils(): number {
  return WORKOUT_HISTORY_TRAINING_UTILS.length
}

export function workoutHistoryTrainingBlockRange(): { from: number; to: number } {
  return { from: 395, to: 448 }
}

export const WORKOUT_HISTORY_TRAINING_V2_OPEN_OLEADA = 440