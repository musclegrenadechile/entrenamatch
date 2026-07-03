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
] as const

export function countFuelPlanTrainingUtils(): number {
  return FUEL_PLAN_TRAINING_UTILS.length
}

export function fuelPlanTrainingBlockRange(): { from: number; to: number } {
  return { from: 411, to: 411 }
}