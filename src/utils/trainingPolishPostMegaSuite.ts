/** Pulido post-mega Fuel×EntrenaPlan oleadas 415–419 (oleada 419 cierre trilogía headline E2E). */

export type TrainingPolishPostMegaCover = 'nutrition' | 'aria' | 'e2e'

export type TrainingPolishPostMegaEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly TrainingPolishPostMegaCover[]
}

export const TRAINING_POLISH_POST_MEGA_UTILS: readonly TrainingPolishPostMegaEntry[] = [
  {
    id: 'nutrition-display',
    module: 'weeklyPlanNutritionDisplay',
    oleada: 415,
    covers: ['nutrition', 'aria'],
  },
  {
    id: 'nutrition-e2e-surplus',
    module: 'e2eWeeklyPlanHistoryFlow',
    oleada: 416,
    covers: ['nutrition', 'e2e', 'aria'],
  },
  {
    id: 'nutrition-e2e-under-fueled',
    module: 'e2eTrainingMegaFlow',
    oleada: 417,
    covers: ['nutrition', 'e2e', 'aria'],
  },
  {
    id: 'post-mega-closure',
    module: 'trainingPolishPostMegaSuite',
    oleada: 417,
    covers: ['nutrition', 'aria', 'e2e'],
  },
  {
    id: 'headline-fuel-chip',
    module: 'weeklyPlanHeadlineFuelDisplay',
    oleada: 418,
    covers: ['nutrition', 'aria'],
  },
  {
    id: 'nutrition-coverage-closure',
    module: 'e2eFuelPlanNutritionCoverage',
    oleada: 418,
    covers: ['nutrition', 'e2e', 'aria'],
  },
  {
    id: 'headline-e2e-trilogy',
    module: 'e2eFuelPlanHeadlineCoverage',
    oleada: 419,
    covers: ['nutrition', 'e2e', 'aria'],
  },
] as const

export const TRAINING_POLISH_POST_MEGA_CLOSED_OLEADA = 419

export function trainingPolishPostMegaRange(): { from: number; to: number } {
  return { from: 415, to: 419 }
}

export function countTrainingPolishPostMegaUtils(): number {
  return TRAINING_POLISH_POST_MEGA_UTILS.length
}

export function isTrainingPolishPostMegaClosed(
  oleada = TRAINING_POLISH_POST_MEGA_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_POST_MEGA_CLOSED_OLEADA
}