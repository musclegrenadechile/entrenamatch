/** Inventario E2E cierre post-fuel EntrenaPlan×historial oleadas 430–432 (oleada 432). */
import { unionFuelPlanCovers } from './e2eFuelPlanCoverage'
import { isFuelPlanHistoryToneCoverageComplete } from './e2eFuelPlanHistoryToneCoverage'
import { isFuelPlanRotationToneCoverageComplete } from './e2eFuelPlanRotationToneCoverage'
import { isTrainingPolishPostFuelClosed } from './trainingPolishPostFuelSuite'

export const FUEL_PLAN_POST_FUEL_COVERAGE_MODULES = [
  'weeklyPlanFuelHistoryToneDisplay',
  'weeklyPlanFuelRotationToneDisplay',
  'e2eFuelPlanHistoryToneCoverage',
  'e2eFuelPlanRotationToneCoverage',
] as const

export type FuelPlanPostFuelCoverageModule =
  (typeof FUEL_PLAN_POST_FUEL_COVERAGE_MODULES)[number]

const POST_FUEL_COVERS = ['fuel-history-tone', 'fuel-rotation-tone'] as const

export function countFuelPlanPostFuelCoverageModules(): number {
  return FUEL_PLAN_POST_FUEL_COVERAGE_MODULES.length
}

export function e2eFuelPlanPostFuelBlockRange(): { from: number; to: number } {
  return { from: 430, to: 432 }
}

export function isFuelPlanPostFuelE2ECoverageComplete(): boolean {
  const covers = unionFuelPlanCovers()
  return (
    isTrainingPolishPostFuelClosed(432) &&
    isFuelPlanHistoryToneCoverageComplete() &&
    isFuelPlanRotationToneCoverageComplete() &&
    POST_FUEL_COVERS.every((c) => covers.includes(c))
  )
}