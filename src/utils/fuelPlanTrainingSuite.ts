/** Inventario Fuel × EntrenaPlan semanal (oleada 411+). */
export type FuelPlanTrainingCover = 'fuel-hint' | 'aria' | 'card'

export type FuelPlanTrainingUtilEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly FuelPlanTrainingCover[]
}

export const FUEL_PLAN_TRAINING_UTILS: readonly FuelPlanTrainingUtilEntry[] = [
  {
    id: 'fuel-week-hint',
    module: 'weeklyPlanFuelWeekDisplay',
    oleada: 411,
    covers: ['fuel-hint', 'aria', 'card'],
  },
  {
    id: 'fuel-week-tone',
    module: 'weeklyPlanFuelWeekToneDisplay',
    oleada: 412,
    covers: ['fuel-hint', 'card'],
  },
  {
    id: 'fuel-week-e2e',
    module: 'e2eTrainingMegaFlow',
    oleada: 412,
    covers: ['fuel-hint', 'aria'],
  },
  {
    id: 'fuel-week-chip',
    module: 'weeklyPlanFuelWeekChipDisplay',
    oleada: 413,
    covers: ['fuel-hint', 'card'],
  },
  {
    id: 'fuel-week-seed',
    module: 'demoFuelWeekLogs',
    oleada: 413,
    covers: ['fuel-hint'],
  },
  {
    id: 'fuel-week-plan-e2e',
    module: 'e2eWeeklyPlanHistoryFlow',
    oleada: 413,
    covers: ['fuel-hint', 'aria'],
  },
  {
    id: 'fuel-week-fuel-e2e',
    module: 'e2eWorkoutFuelFlow',
    oleada: 414,
    covers: ['fuel-hint', 'aria'],
  },
  {
    id: 'fuel-plan-e2e-suite',
    module: 'e2eFuelPlanCoverage',
    oleada: 414,
    covers: ['fuel-hint', 'aria', 'card'],
  },
  {
    id: 'fuel-block-closure',
    module: 'fuelPlanTrainingSuite',
    oleada: 414,
    covers: ['fuel-hint', 'aria', 'card'],
  },
  {
    id: 'fuel-nutrition-note',
    module: 'weeklyPlanNutritionDisplay',
    oleada: 415,
    covers: ['fuel-hint', 'card'],
  },
  {
    id: 'mega-closure-ii',
    module: 'trainingMegaSuite',
    oleada: 415,
    covers: ['fuel-hint', 'card'],
  },
  {
    id: 'nutrition-aria',
    module: 'weeklyPlanNutritionDisplay',
    oleada: 416,
    covers: ['aria', 'card'],
  },
  {
    id: 'nutrition-e2e-surplus',
    module: 'e2eWeeklyPlanHistoryFlow',
    oleada: 416,
    covers: ['fuel-hint', 'aria'],
  },
  {
    id: 'post-mega-suite',
    module: 'trainingPolishPostMegaSuite',
    oleada: 416,
    covers: ['fuel-hint', 'aria', 'card'],
  },
  {
    id: 'nutrition-e2e-mega',
    module: 'e2eTrainingMegaFlow',
    oleada: 417,
    covers: ['fuel-hint', 'aria'],
  },
  {
    id: 'nutrition-trilogy-closure',
    module: 'e2eFuelPlanCoverage',
    oleada: 417,
    covers: ['fuel-hint', 'aria'],
  },
  {
    id: 'headline-fuel-chip',
    module: 'weeklyPlanHeadlineFuelDisplay',
    oleada: 418,
    covers: ['fuel-hint', 'aria', 'card'],
  },
  {
    id: 'nutrition-coverage-closure',
    module: 'e2eFuelPlanNutritionCoverage',
    oleada: 418,
    covers: ['fuel-hint', 'aria'],
  },
  {
    id: 'headline-e2e-trilogy',
    module: 'e2eFuelPlanHeadlineCoverage',
    oleada: 419,
    covers: ['fuel-hint', 'aria', 'card'],
  },
  {
    id: 'full-coverage-closure',
    module: 'e2eFuelPlanFullCoverage',
    oleada: 420,
    covers: ['fuel-hint', 'aria', 'card'],
  },
  {
    id: 'mega-closure-iii',
    module: 'trainingMegaSuite',
    oleada: 420,
    covers: ['fuel-hint', 'card'],
  },
  {
    id: 'fuel-scenario-sync',
    module: 'weeklyPlanFuelScenarioSync',
    oleada: 421,
    covers: ['fuel-hint', 'card'],
  },
  {
    id: 'fuel-scenario-e2e',
    module: 'e2eFuelPlanScenarioCoverage',
    oleada: 421,
    covers: ['fuel-hint', 'aria'],
  },
  {
    id: 'fuel-row-tone',
    module: 'weeklyPlanFuelRowToneDisplay',
    oleada: 422,
    covers: ['fuel-hint', 'card'],
  },
  {
    id: 'fuel-tone-stack',
    module: 'weeklyPlanFuelToneStackDisplay',
    oleada: 423,
    covers: ['fuel-hint', 'card'],
  },
  {
    id: 'fuel-tone-e2e',
    module: 'e2eFuelPlanToneCoverage',
    oleada: 423,
    covers: ['fuel-hint', 'aria'],
  },
  {
    id: 'fuel-nutrition-tone',
    module: 'weeklyPlanNutritionToneDisplay',
    oleada: 424,
    covers: ['fuel-hint', 'card'],
  },
  {
    id: 'fuel-tone-expected',
    module: 'weeklyPlanFuelToneStackExpectedDisplay',
    oleada: 425,
    covers: ['fuel-hint', 'card'],
  },
  {
    id: 'fuel-tone-aria',
    module: 'weeklyPlanFuelToneStackAriaDisplay',
    oleada: 426,
    covers: ['fuel-hint', 'aria'],
  },
  {
    id: 'fuel-tone-card',
    module: 'weeklyPlanFuelToneStackCardDisplay',
    oleada: 427,
    covers: ['fuel-hint', 'aria', 'card'],
  },
  {
    id: 'post-full-closure',
    module: 'e2eFuelPlanPostFullCoverage',
    oleada: 427,
    covers: ['fuel-hint', 'aria', 'card'],
  },
  {
    id: 'mega-closure-iv',
    module: 'trainingMegaSuite',
    oleada: 427,
    covers: ['fuel-hint', 'card'],
  },
  {
    id: 'fuel-tone-full',
    module: 'weeklyPlanFuelToneStackFullDisplay',
    oleada: 428,
    covers: ['fuel-hint', 'aria', 'card'],
  },
  {
    id: 'post-stack-open',
    module: 'trainingPolishPostStackSuite',
    oleada: 428,
    covers: ['fuel-hint', 'card'],
  },
  {
    id: 'post-stack-closure',
    module: 'e2eFuelPlanPostStackCoverage',
    oleada: 429,
    covers: ['fuel-hint', 'aria', 'card'],
  },
  {
    id: 'mega-closure-v',
    module: 'trainingMegaSuite',
    oleada: 429,
    covers: ['fuel-hint', 'card'],
  },
  {
    id: 'fuel-history-tone',
    module: 'weeklyPlanFuelHistoryToneDisplay',
    oleada: 430,
    covers: ['fuel-hint', 'aria', 'card'],
  },
  {
    id: 'fuel-history-tone-e2e',
    module: 'e2eFuelPlanHistoryToneCoverage',
    oleada: 430,
    covers: ['fuel-hint', 'aria'],
  },
  {
    id: 'post-fuel-open',
    module: 'trainingPolishPostFuelSuite',
    oleada: 430,
    covers: ['fuel-hint', 'card'],
  },
  {
    id: 'fuel-rotation-tone',
    module: 'weeklyPlanFuelRotationToneDisplay',
    oleada: 431,
    covers: ['fuel-hint', 'aria', 'card'],
  },
  {
    id: 'fuel-rotation-tone-e2e',
    module: 'e2eFuelPlanRotationToneCoverage',
    oleada: 431,
    covers: ['fuel-hint', 'aria'],
  },
  {
    id: 'post-fuel-closure',
    module: 'e2eFuelPlanPostFuelCoverage',
    oleada: 432,
    covers: ['fuel-hint', 'aria', 'card'],
  },
  {
    id: 'mega-closure-vi',
    module: 'trainingMegaSuite',
    oleada: 432,
    covers: ['fuel-hint', 'card'],
  },
] as const

export const FUEL_PLAN_TRAINING_CLOSED_OLEADA = 414

export function countFuelPlanTrainingUtils(): number {
  return FUEL_PLAN_TRAINING_UTILS.length
}

export function fuelPlanTrainingBlockRange(): { from: number; to: number } {
  return { from: 411, to: 432 }
}

export function isFuelPlanTrainingBlockClosed(
  oleada = FUEL_PLAN_TRAINING_CLOSED_OLEADA
): boolean {
  return oleada >= FUEL_PLAN_TRAINING_CLOSED_OLEADA
}