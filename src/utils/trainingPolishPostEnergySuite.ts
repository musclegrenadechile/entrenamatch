/** Pulido post-energy Fuel×EntrenaPlan oleada 433+ (mega fase VII). */

export type TrainingPolishPostEnergyCover = 'energy' | 'aria' | 'e2e' | 'fuel'

export type TrainingPolishPostEnergyEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPolishPostEnergyCover[]
}

export const TRAINING_POLISH_POST_ENERGY_UTILS: readonly TrainingPolishPostEnergyEntry[] = [
  {
    id: 'fuel-energy-tone',
    module: 'weeklyPlanFuelEnergySummaryToneDisplay',
    oleada: 433,
    covers: ['energy', 'aria', 'fuel', 'e2e'],
  },
  {
    id: 'post-energy-closure',
    module: 'e2eFuelPlanPostEnergyCoverage',
    oleada: 434,
    covers: ['energy', 'aria', 'fuel', 'e2e'],
  },
] as const

export const TRAINING_POLISH_POST_ENERGY_CLOSED_OLEADA = 434

export function trainingPolishPostEnergyRange(): { from: number; to: number } {
  return { from: 433, to: 434 }
}

export function countTrainingPolishPostEnergyUtils(): number {
  return TRAINING_POLISH_POST_ENERGY_UTILS.length
}

export function isTrainingPolishPostEnergyClosed(
  oleada = TRAINING_POLISH_POST_ENERGY_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_POST_ENERGY_CLOSED_OLEADA
}