/** Pulido post-full Fuel×EntrenaPlan oleada 421+ (borde escenario sincronizado). */

export type TrainingPolishPostFullCover = 'scenario' | 'border' | 'e2e'

export type TrainingPolishPostFullEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPolishPostFullCover[]
}

export const TRAINING_POLISH_POST_FULL_UTILS: readonly TrainingPolishPostFullEntry[] = [
  {
    id: 'fuel-scenario-sync',
    module: 'weeklyPlanFuelScenarioSync',
    oleada: 421,
    covers: ['scenario', 'border'],
  },
  {
    id: 'fuel-scenario-e2e',
    module: 'e2eFuelPlanScenarioCoverage',
    oleada: 421,
    covers: ['scenario', 'border', 'e2e'],
  },
  {
    id: 'fuel-row-tone',
    module: 'weeklyPlanFuelRowToneDisplay',
    oleada: 422,
    covers: ['scenario', 'border'],
  },
] as const

export const TRAINING_POLISH_POST_FULL_CLOSED_OLEADA = 422

export function trainingPolishPostFullRange(): { from: number; to: number } {
  return { from: 421, to: 422 }
}

export function countTrainingPolishPostFullUtils(): number {
  return TRAINING_POLISH_POST_FULL_UTILS.length
}

export function isTrainingPolishPostFullClosed(
  oleada = TRAINING_POLISH_POST_FULL_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_POST_FULL_CLOSED_OLEADA
}