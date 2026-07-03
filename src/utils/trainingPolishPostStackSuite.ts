/** Pulido post-stack Fuel×EntrenaPlan oleada 428+ (mega fase V). */

export type TrainingPolishPostStackCover = 'scenario' | 'border' | 'e2e' | 'full'

export type TrainingPolishPostStackEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPolishPostStackCover[]
}

export const TRAINING_POLISH_POST_STACK_UTILS: readonly TrainingPolishPostStackEntry[] = [
  {
    id: 'fuel-tone-full',
    module: 'weeklyPlanFuelToneStackFullDisplay',
    oleada: 428,
    covers: ['scenario', 'border', 'e2e', 'full'],
  },
] as const

export const TRAINING_POLISH_POST_STACK_CLOSED_OLEADA = 428

export function trainingPolishPostStackRange(): { from: number; to: number } {
  return { from: 428, to: 428 }
}

export function countTrainingPolishPostStackUtils(): number {
  return TRAINING_POLISH_POST_STACK_UTILS.length
}

export function isTrainingPolishPostStackClosed(
  oleada = TRAINING_POLISH_POST_STACK_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_POST_STACK_CLOSED_OLEADA
}