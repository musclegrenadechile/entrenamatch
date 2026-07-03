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
] as const

export const FUEL_PLAN_TRAINING_CLOSED_OLEADA = 414

export function countFuelPlanTrainingUtils(): number {
  return FUEL_PLAN_TRAINING_UTILS.length
}

export function fuelPlanTrainingBlockRange(): { from: number; to: number } {
  return { from: 411, to: 414 }
}

export function isFuelPlanTrainingBlockClosed(
  oleada = FUEL_PLAN_TRAINING_CLOSED_OLEADA
): boolean {
  return oleada >= FUEL_PLAN_TRAINING_CLOSED_OLEADA
}