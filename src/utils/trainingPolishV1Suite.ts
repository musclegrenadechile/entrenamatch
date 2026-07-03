/** Inventario pulido entrenamiento I oleadas 361–377 (oleada 406). */
export type TrainingPolishV1Cover = 'cards' | 'arena' | 'plan' | 'gym-log' | 'pr' | 'fab' | 'history'

export type TrainingPolishV1UtilEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPolishV1Cover[]
}

export const TRAINING_POLISH_V1_UTILS: readonly TrainingPolishV1UtilEntry[] = [
  {
    id: 'pr-confetti',
    module: 'workoutPRConfetti',
    oleada: 368,
    covers: ['pr'],
  },
  {
    id: 'draft-banner',
    module: 'workoutDraftBannerMeta',
    oleada: 370,
    covers: ['fab'],
  },
  {
    id: 'history-badges',
    module: 'workoutHistoryBadges',
    oleada: 371,
    covers: ['history'],
  },
  {
    id: 'sparkline',
    module: 'workoutHistorySparkline',
    oleada: 372,
    covers: ['history'],
  },
  {
    id: 'fab-draft',
    module: 'workoutFabDraftMeta',
    oleada: 373,
    covers: ['fab'],
  },
  {
    id: 'progress',
    module: 'workoutProgress',
    oleada: 373,
    covers: ['gym-log'],
  },
  {
    id: 'library',
    module: 'gymLogLibraryDisplay',
    oleada: 374,
    covers: ['gym-log'],
  },
  {
    id: 'set-rows',
    module: 'gymLogSetDisplay',
    oleada: 375,
    covers: ['gym-log'],
  },
  {
    id: 'set-step',
    module: 'gymLogSetStep',
    oleada: 376,
    covers: ['gym-log'],
  },
  {
    id: 'duplicate-set',
    module: 'gymLogDuplicateSet',
    oleada: 377,
    covers: ['gym-log'],
  },
] as const

export function countTrainingPolishV1Utils(): number {
  return TRAINING_POLISH_V1_UTILS.length
}

export function trainingPolishV1BlockRange(): { from: number; to: number } {
  return { from: 361, to: 377 }
}