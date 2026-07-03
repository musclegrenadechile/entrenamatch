/** Cierre post-mega PR v2 pulido entrenamiento oleada 453. */

export type TrainingPolishPrV2PostMegaCover = 'pr' | 'e2e' | 'inventory' | 'closure'

export type TrainingPolishPrV2PostMegaEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPolishPrV2PostMegaCover[]
}

export const TRAINING_POLISH_PR_V2_POST_MEGA_UTILS: readonly TrainingPolishPrV2PostMegaEntry[] =
  [
    {
      id: 'pr-v2-post-mega-closure',
      module: 'trainingPrV2PostMegaClosure',
      oleada: 453,
      covers: ['pr', 'inventory', 'closure', 'e2e'],
    },
    {
      id: 'pr-v2-post-mega-e2e',
      module: 'e2eTrainingPrV2PostMegaCoverage',
      oleada: 453,
      covers: ['pr', 'inventory', 'closure', 'e2e'],
    },
    {
      id: 'pr-v2-post-mega-global-closure',
      module: 'trainingPolishPrV2PostMegaGlobalSuite',
      oleada: 454,
      covers: ['pr', 'inventory', 'closure', 'e2e'],
    },
  ] as const

export const TRAINING_POLISH_PR_V2_POST_MEGA_CLOSED_OLEADA = 453

export function trainingPolishPrV2PostMegaRange(): { from: number; to: number } {
  return { from: 453, to: 454 }
}

export function countTrainingPolishPrV2PostMegaUtils(): number {
  return TRAINING_POLISH_PR_V2_POST_MEGA_UTILS.length
}

export function isTrainingPolishPrV2PostMegaClosed(
  oleada = TRAINING_POLISH_PR_V2_POST_MEGA_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_PR_V2_POST_MEGA_CLOSED_OLEADA
}