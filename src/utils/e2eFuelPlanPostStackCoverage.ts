/** Inventario E2E cierre post-stack Fuel×EntrenaPlan oleadas 428–429 (oleada 429). */
import { unionFuelPlanCovers } from './e2eFuelPlanCoverage'
import { isFuelPlanToneFullCoverageComplete } from './e2eFuelPlanToneCoverage'
import { isTrainingPolishPostStackClosed } from './trainingPolishPostStackSuite'

export const FUEL_PLAN_POST_STACK_COVERAGE_MODULES = [
  'weeklyPlanFuelToneStackFullDisplay',
  'e2eFuelPlanToneCoverage',
  'weeklyPlanFuelToneStackCardDisplay',
] as const

export type FuelPlanPostStackCoverageModule =
  (typeof FUEL_PLAN_POST_STACK_COVERAGE_MODULES)[number]

const POST_STACK_FUEL_COVERS = ['fuel-tone-full'] as const

export function countFuelPlanPostStackCoverageModules(): number {
  return FUEL_PLAN_POST_STACK_COVERAGE_MODULES.length
}

export function e2eFuelPlanPostStackBlockRange(): { from: number; to: number } {
  return { from: 428, to: 429 }
}

export function isFuelPlanPostStackE2ECoverageComplete(): boolean {
  const covers = unionFuelPlanCovers()
  return (
    isTrainingPolishPostStackClosed(429) &&
    isFuelPlanToneFullCoverageComplete() &&
    POST_STACK_FUEL_COVERS.every((c) => covers.includes(c))
  )
}