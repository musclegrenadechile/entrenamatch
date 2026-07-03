/** Pulido gym-log v2 post-mega-global oleada 436+. */

export type TrainingPolishGymLogV2Cover = 'session' | 'pr' | 'aria' | 'e2e'

export type TrainingPolishGymLogV2Entry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPolishGymLogV2Cover[]
}

export const TRAINING_POLISH_GYM_LOG_V2_UTILS: readonly TrainingPolishGymLogV2Entry[] = [
  {
    id: 'session-pr-tone',
    module: 'gymLogSessionPrToneDisplay',
    oleada: 436,
    covers: ['session', 'pr', 'aria', 'e2e'],
  },
  {
    id: 'fab-session-pr-tone',
    module: 'gymLogFabSessionPrToneDisplay',
    oleada: 437,
    covers: ['session', 'pr', 'aria', 'e2e'],
  },
] as const

export const TRAINING_POLISH_GYM_LOG_V2_OPEN_OLEADA = 436

export function trainingPolishGymLogV2Range(): { from: number; to: number } {
  return { from: 436, to: 437 }
}

export function countTrainingPolishGymLogV2Utils(): number {
  return TRAINING_POLISH_GYM_LOG_V2_UTILS.length
}

export function isTrainingPolishGymLogV2Open(
  oleada = TRAINING_POLISH_GYM_LOG_V2_OPEN_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_GYM_LOG_V2_OPEN_OLEADA
}