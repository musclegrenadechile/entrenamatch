/** Inventario E2E cierre post-energy Fuel×EntrenaPlan oleadas 433–434 (oleada 434). */
import { unionFuelPlanCovers } from './e2eFuelPlanCoverage'
import { isFuelPlanEnergySummaryToneCoverageComplete } from './e2eFuelPlanEnergySummaryToneCoverage'
import { isTrainingPolishPostEnergyClosed } from './trainingPolishPostEnergySuite'

export const FUEL_PLAN_POST_ENERGY_COVERAGE_MODULES = [
  'weeklyPlanFuelEnergySummaryToneDisplay',
  'e2eFuelPlanEnergySummaryToneCoverage',
] as const

export type FuelPlanPostEnergyCoverageModule =
  (typeof FUEL_PLAN_POST_ENERGY_COVERAGE_MODULES)[number]

const POST_ENERGY_COVERS = ['fuel-energy-tone'] as const

export function countFuelPlanPostEnergyCoverageModules(): number {
  return FUEL_PLAN_POST_ENERGY_COVERAGE_MODULES.length
}

export function e2eFuelPlanPostEnergyBlockRange(): { from: number; to: number } {
  return { from: 433, to: 434 }
}

export function isFuelPlanPostEnergyE2ECoverageComplete(): boolean {
  const covers = unionFuelPlanCovers()
  return (
    isTrainingPolishPostEnergyClosed(434) &&
    isFuelPlanEnergySummaryToneCoverageComplete() &&
    POST_ENERGY_COVERS.every((c) => covers.includes(c))
  )
}