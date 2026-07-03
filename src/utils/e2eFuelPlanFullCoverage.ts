/** Mega-inventario E2E Fuel×EntrenaPlan — unifica 7 suites (oleada 429). */
import { isFuelPlanPostFullE2ECoverageComplete } from './e2eFuelPlanPostFullCoverage'
import { isFuelPlanPostStackE2ECoverageComplete } from './e2eFuelPlanPostStackCoverage'
import {
  isFuelPlanNutritionE2ETrilogyComplete,
  unionFuelPlanCovers,
} from './e2eFuelPlanCoverage'
import { isFuelPlanHeadlineCoverageComplete } from './e2eFuelPlanHeadlineCoverage'
import { isFuelPlanNutritionCoverageComplete } from './e2eFuelPlanNutritionCoverage'
import { isFuelPlanScenarioCoverageComplete } from './e2eFuelPlanScenarioCoverage'
import {
  isFuelPlanToneAriaCoverageComplete,
  isFuelPlanToneCardCoverageComplete,
  isFuelPlanToneCoverageComplete,
  isFuelPlanToneExpectedCoverageComplete,
  isFuelPlanToneFullCoverageComplete,
} from './e2eFuelPlanToneCoverage'
import { isTrainingPolishPostStackClosed } from './trainingPolishPostStackSuite'

export const FUEL_PLAN_FULL_COVERAGE_MODULES = [
  'e2eFuelPlanCoverage',
  'e2eFuelPlanNutritionCoverage',
  'e2eFuelPlanHeadlineCoverage',
  'e2eFuelPlanScenarioCoverage',
  'e2eFuelPlanToneCoverage',
  'e2eFuelPlanPostFullCoverage',
  'e2eFuelPlanPostStackCoverage',
] as const

export type FuelPlanFullCoverageModule = (typeof FUEL_PLAN_FULL_COVERAGE_MODULES)[number]

export function countFuelPlanCoverageSuites(): number {
  return FUEL_PLAN_FULL_COVERAGE_MODULES.length
}

export function e2eFuelPlanFullBlockRange(): { from: number; to: number } {
  return { from: 412, to: 429 }
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
    isFuelPlanToneCardCoverageComplete() &&
    isFuelPlanToneFullCoverageComplete() &&
    isTrainingPolishPostStackClosed(429) &&
    unionFuelPlanCovers().includes('fuel-tone-full') &&
    unionFuelPlanCovers().includes('fuel-tone-card') &&
    unionFuelPlanCovers().includes('fuel-headline') &&
    unionFuelPlanCovers().includes('fuel-scenario') &&
    unionFuelPlanCovers().includes('fuel-row-tone') &&
    unionFuelPlanCovers().includes('fuel-tone-stack') &&
    unionFuelPlanCovers().includes('fuel-nutrition-tone') &&
    unionFuelPlanCovers().includes('fuel-tone-expected') &&
    unionFuelPlanCovers().includes('fuel-tone-aria') &&
    unionFuelPlanCovers().includes('fuel-tone-card') &&
    isFuelPlanPostFullE2ECoverageComplete() &&
    isFuelPlanPostStackE2ECoverageComplete()
  )
}