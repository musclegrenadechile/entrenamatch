/** Mega-inventario E2E Fuel×EntrenaPlan — unifica 3 suites (oleada 420). */
import {
  isFuelPlanNutritionE2ETrilogyComplete,
  unionFuelPlanCovers,
} from './e2eFuelPlanCoverage'
import { isFuelPlanHeadlineCoverageComplete } from './e2eFuelPlanHeadlineCoverage'
import { isFuelPlanNutritionCoverageComplete } from './e2eFuelPlanNutritionCoverage'
import { isFuelPlanScenarioCoverageComplete } from './e2eFuelPlanScenarioCoverage'
import {
  isFuelPlanToneAriaCoverageComplete,
  isFuelPlanToneCoverageComplete,
  isFuelPlanToneExpectedCoverageComplete,
} from './e2eFuelPlanToneCoverage'

export const FUEL_PLAN_FULL_COVERAGE_MODULES = [
  'e2eFuelPlanCoverage',
  'e2eFuelPlanNutritionCoverage',
  'e2eFuelPlanHeadlineCoverage',
  'e2eFuelPlanScenarioCoverage',
  'e2eFuelPlanToneCoverage',
] as const

export type FuelPlanFullCoverageModule = (typeof FUEL_PLAN_FULL_COVERAGE_MODULES)[number]

export function countFuelPlanCoverageSuites(): number {
  return FUEL_PLAN_FULL_COVERAGE_MODULES.length
}

export function e2eFuelPlanFullBlockRange(): { from: number; to: number } {
  return { from: 412, to: 426 }
}

/** Cobertura Fuel×plan + nutrición + headline en 3 specs CI (oleada 420). */
export function isFuelPlanFullE2ECoverageComplete(): boolean {
  return (
    isFuelPlanNutritionE2ETrilogyComplete() &&
    isFuelPlanNutritionCoverageComplete() &&
    isFuelPlanHeadlineCoverageComplete() &&
    isFuelPlanScenarioCoverageComplete() &&
    isFuelPlanToneCoverageComplete() &&
    isFuelPlanToneExpectedCoverageComplete() &&
    isFuelPlanToneAriaCoverageComplete() &&
    unionFuelPlanCovers().includes('fuel-headline') &&
    unionFuelPlanCovers().includes('fuel-scenario') &&
    unionFuelPlanCovers().includes('fuel-row-tone') &&
    unionFuelPlanCovers().includes('fuel-tone-stack') &&
    unionFuelPlanCovers().includes('fuel-nutrition-tone') &&
    unionFuelPlanCovers().includes('fuel-tone-expected') &&
    unionFuelPlanCovers().includes('fuel-tone-aria')
  )
}