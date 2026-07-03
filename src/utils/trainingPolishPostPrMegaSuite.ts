/** Pulido union mega post-PR oleadas 445–452 (oleada 452 cierre post-v2). */

export type TrainingPolishPostPrMegaCover = 'pr' | 'e2e' | 'inventory' | 'review' | 'sparkline'

export type TrainingPolishPostPrMegaEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPolishPostPrMegaCover[]
}

export const TRAINING_POLISH_POST_PR_MEGA_UTILS: readonly TrainingPolishPostPrMegaEntry[] = [
  {
    id: 'post-pr-mega-coverage',
    module: 'e2eTrainingPostPrMegaCoverage',
    oleada: 451,
    covers: ['pr', 'e2e', 'inventory', 'review', 'sparkline'],
  },
  {
    id: 'post-pr-mega-post-v2-closure',
    module: 'e2eTrainingPostPrMegaPostV2Coverage',
    oleada: 452,
    covers: ['pr', 'e2e', 'inventory', 'review', 'sparkline'],
  },
] as const

export const TRAINING_POLISH_POST_PR_MEGA_OLEADA = 451
export const TRAINING_POLISH_POST_PR_MEGA_CLOSED_OLEADA = 452

export function trainingPolishPostPrMegaRange(): { from: number; to: number } {
  return { from: 451, to: 452 }
}

export function countTrainingPolishPostPrMegaUtils(): number {
  return TRAINING_POLISH_POST_PR_MEGA_UTILS.length
}

export function isTrainingPolishPostPrMegaClosed(
  oleada = TRAINING_POLISH_POST_PR_MEGA_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_POST_PR_MEGA_CLOSED_OLEADA
}