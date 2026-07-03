/** Pulido post-fuel EntrenaPlan×historial oleada 430+ (mega fase VI). */

export type TrainingPolishPostFuelCover = 'history' | 'aria' | 'e2e' | 'fuel'

export type TrainingPolishPostFuelEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPolishPostFuelCover[]
}

export const TRAINING_POLISH_POST_FUEL_UTILS: readonly TrainingPolishPostFuelEntry[] = [
  {
    id: 'fuel-history-tone',
    module: 'weeklyPlanFuelHistoryToneDisplay',
    oleada: 430,
    covers: ['history', 'aria', 'fuel', 'e2e'],
  },
] as const

export const TRAINING_POLISH_POST_FUEL_CLOSED_OLEADA = 430

export function trainingPolishPostFuelRange(): { from: number; to: number } {
  return { from: 430, to: 430 }
}

export function countTrainingPolishPostFuelUtils(): number {
  return TRAINING_POLISH_POST_FUEL_UTILS.length
}

export function isTrainingPolishPostFuelClosed(
  oleada = TRAINING_POLISH_POST_FUEL_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_POST_FUEL_CLOSED_OLEADA
}