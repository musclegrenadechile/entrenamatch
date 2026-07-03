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
  {
    id: 'fuel-tone-stack',
    module: 'weeklyPlanFuelToneStackDisplay',
    oleada: 423,
    covers: ['scenario', 'border'],
  },
  {
    id: 'fuel-tone-e2e',
    module: 'e2eFuelPlanToneCoverage',
    oleada: 423,
    covers: ['scenario', 'border', 'e2e'],
  },
  {
    id: 'fuel-nutrition-tone',
    module: 'weeklyPlanNutritionToneDisplay',
    oleada: 424,
    covers: ['scenario', 'border'],
  },
  {
    id: 'fuel-tone-expected',
    module: 'weeklyPlanFuelToneStackExpectedDisplay',
    oleada: 425,
    covers: ['scenario', 'border', 'e2e'],
  },
  {
    id: 'fuel-tone-aria',
    module: 'weeklyPlanFuelToneStackAriaDisplay',
    oleada: 426,
    covers: ['scenario', 'border', 'e2e'],
  },
] as const

export const TRAINING_POLISH_POST_FULL_CLOSED_OLEADA = 426

export function trainingPolishPostFullRange(): { from: number; to: number } {
  return { from: 421, to: 426 }
}

export function countTrainingPolishPostFullUtils(): number {
  return TRAINING_POLISH_POST_FULL_UTILS.length
}

export function isTrainingPolishPostFullClosed(
  oleada = TRAINING_POLISH_POST_FULL_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_POST_FULL_CLOSED_OLEADA
}