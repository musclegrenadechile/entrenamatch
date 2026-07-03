/** Inventario utils del bloque gym-log en vivo (oleadas 383–386). */
export type GymLogTrainingCover = 'progress' | 'pr' | 'feedback' | 'hint'

export type GymLogTrainingUtilEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly GymLogTrainingCover[]
}

export const GYM_LOG_TRAINING_UTILS: readonly GymLogTrainingUtilEntry[] = [
  {
    id: 'session-display',
    module: 'gymLogSessionDisplay',
    oleada: 383,
    covers: ['progress'],
  },
  {
    id: 'live-pr',
    module: 'gymLogLivePR',
    oleada: 384,
    covers: ['pr'],
  },
  {
    id: 'pr-feedback',
    module: 'gymLogPRFeedback',
    oleada: 385,
    covers: ['feedback'],
  },
  {
    id: 'live-pr-hint',
    module: 'gymLogLivePRHint',
    oleada: 386,
    covers: ['hint'],
  },
  {
    id: 'session-pr-tone',
    module: 'gymLogSessionPrToneDisplay',
    oleada: 436,
    covers: ['pr', 'hint'],
  },
  {
    id: 'session-pr-tone-e2e',
    module: 'e2eGymLogSessionPrCoverage',
    oleada: 436,
    covers: ['pr', 'hint'],
  },
  {
    id: 'gym-log-v2-open',
    module: 'trainingPolishGymLogV2Suite',
    oleada: 436,
    covers: ['pr', 'hint'],
  },
  {
    id: 'fab-session-pr-tone',
    module: 'gymLogFabSessionPrToneDisplay',
    oleada: 437,
    covers: ['pr', 'hint'],
  },
  {
    id: 'fab-session-pr-tone-e2e',
    module: 'e2eGymLogFabSessionPrCoverage',
    oleada: 437,
    covers: ['pr', 'hint'],
  },
  {
    id: 'gym-log-coverage',
    module: 'e2eGymLogCoverage',
    oleada: 438,
    covers: ['pr', 'hint'],
  },
  {
    id: 'post-v2-closure',
    module: 'e2eGymLogPostV2Coverage',
    oleada: 438,
    covers: ['pr', 'hint'],
  },
  {
    id: 'gym-log-full-coverage',
    module: 'e2eGymLogFullCoverage',
    oleada: 438,
    covers: ['pr', 'hint'],
  },
] as const

export function countGymLogTrainingUtils(): number {
  return GYM_LOG_TRAINING_UTILS.length
}

export function gymLogTrainingBlockRange(): { from: number; to: number } {
  const oleadas = GYM_LOG_TRAINING_UTILS.map((u) => u.oleada)
  return { from: Math.min(...oleadas), to: Math.max(...oleadas) }
}

export const GYM_LOG_TRAINING_V2_OPEN_OLEADA = 436