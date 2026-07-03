/** Inventario del bloque PR v2 global (oleadas 436–444). */
export type TrainingPrV2TrainingCover = 'pr' | 'inventory' | 'e2e' | 'closure'

export type TrainingPrV2TrainingUtilEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPrV2TrainingCover[]
}

export const TRAINING_PR_V2_TRAINING_UTILS: readonly TrainingPrV2TrainingUtilEntry[] = [
  {
    id: 'pr-v2-suite',
    module: 'trainingPrV2Suite',
    oleada: 444,
    covers: ['pr', 'inventory'],
  },
  {
    id: 'pr-v2-global-closure',
    module: 'trainingPrV2GlobalClosure',
    oleada: 444,
    covers: ['pr', 'closure', 'inventory'],
  },
  {
    id: 'pr-v2-global-e2e',
    module: 'e2eTrainingPrV2GlobalCoverage',
    oleada: 444,
    covers: ['pr', 'e2e', 'closure'],
  },
  {
    id: 'pr-v2-global-polish',
    module: 'trainingPolishPrV2GlobalSuite',
    oleada: 444,
    covers: ['pr', 'closure'],
  },
  {
    id: 'pr-v2-full-coverage',
    module: 'e2eTrainingPrV2FullCoverage',
    oleada: 444,
    covers: ['pr', 'e2e', 'closure'],
  },
] as const

export function countTrainingPrV2TrainingUtils(): number {
  return TRAINING_PR_V2_TRAINING_UTILS.length
}

export function trainingPrV2TrainingBlockRange(): { from: number; to: number } {
  return { from: 436, to: 444 }
}