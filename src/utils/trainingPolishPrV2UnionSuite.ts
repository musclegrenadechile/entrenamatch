/** Pulido union meta PR v2 post-cierre global oleada 447. */

export type TrainingPolishPrV2UnionCover = 'pr' | 'e2e' | 'inventory'

export type TrainingPolishPrV2UnionEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPolishPrV2UnionCover[]
}

export const TRAINING_POLISH_PR_V2_UNION_UTILS: readonly TrainingPolishPrV2UnionEntry[] = [
  {
    id: 'pr-v2-union-coverage',
    module: 'e2eTrainingPrV2Coverage',
    oleada: 447,
    covers: ['pr', 'e2e', 'inventory'],
  },
] as const

export const TRAINING_POLISH_PR_V2_UNION_OLEADA = 447

export function trainingPolishPrV2UnionRange(): { from: number; to: number } {
  return { from: 447, to: 447 }
}

export function countTrainingPolishPrV2UnionUtils(): number {
  return TRAINING_POLISH_PR_V2_UNION_UTILS.length
}