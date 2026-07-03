/** Inventario E2E cierre post-full Fuel×EntrenaPlan oleadas 421–427 (oleada 427). */
import { unionFuelPlanCovers } from './e2eFuelPlanCoverage'
import { isFuelPlanScenarioCoverageComplete } from './e2eFuelPlanScenarioCoverage'
import {
  isFuelPlanToneAriaCoverageComplete,
  isFuelPlanToneCardCoverageComplete,
  isFuelPlanToneCoverageComplete,
  isFuelPlanToneExpectedCoverageComplete,
} from './e2eFuelPlanToneCoverage'
import { isTrainingPolishPostFullClosed } from './trainingPolishPostFullSuite'

export const FUEL_PLAN_POST_FULL_COVERAGE_MODULES = [
  'e2eFuelPlanScenarioCoverage',
  'e2eFuelPlanToneCoverage',
  'weeklyPlanFuelToneStackDisplay',
  'weeklyPlanFuelToneStackExpectedDisplay',
  'weeklyPlanFuelToneStackAriaDisplay',
  'weeklyPlanFuelToneStackCardDisplay',
] as const

export type FuelPlanPostFullCoverageModule =
  (typeof FUEL_PLAN_POST_FULL_COVERAGE_MODULES)[number]

const POST_FULL_FUEL_COVERS = [
  'fuel-scenario',
  'fuel-row-tone',
  'fuel-tone-stack',
  'fuel-nutrition-tone',
  'fuel-tone-expected',
  'fuel-tone-aria',
  'fuel-tone-card',
] as const

export function countFuelPlanPostFullCoverageModules(): number {
  return FUEL_PLAN_POST_FULL_COVERAGE_MODULES.length
}

export function e2eFuelPlanPostFullBlockRange(): { from: number; to: number } {
  return { from: 421, to: 427 }
}

export function isFuelPlanPostFullE2ECoverageComplete(): boolean {
  const covers = unionFuelPlanCovers()
  return (
    isTrainingPolishPostFullClosed(427) &&
    isFuelPlanScenarioCoverageComplete() &&
    isFuelPlanToneCoverageComplete() &&
    isFuelPlanToneExpectedCoverageComplete() &&
    isFuelPlanToneAriaCoverageComplete() &&
    isFuelPlanToneCardCoverageComplete() &&
    POST_FULL_FUEL_COVERS.every((c) => covers.includes(c))
  )
}