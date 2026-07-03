/** Mega-inventario E2E Fuel×EntrenaPlan — unifica 12 suites (oleada 434). */
import { isFuelPlanEnergySummaryToneCoverageComplete } from './e2eFuelPlanEnergySummaryToneCoverage'
import { isFuelPlanPostEnergyE2ECoverageComplete } from './e2eFuelPlanPostEnergyCoverage'
import { isFuelPlanHistoryToneCoverageComplete } from './e2eFuelPlanHistoryToneCoverage'
import { isFuelPlanPostFuelE2ECoverageComplete } from './e2eFuelPlanPostFuelCoverage'
import { isFuelPlanRotationToneCoverageComplete } from './e2eFuelPlanRotationToneCoverage'
import { isFuelPlanPostFullE2ECoverageComplete } from './e2eFuelPlanPostFullCoverage'
import { isFuelPlanPostStackE2ECoverageComplete } from './e2eFuelPlanPostStackCoverage'
import { isTrainingPolishPostEnergyClosed } from './trainingPolishPostEnergySuite'
import { isTrainingPolishPostFuelClosed } from './trainingPolishPostFuelSuite'
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
  'e2eFuelPlanHistoryToneCoverage',
  'e2eFuelPlanRotationToneCoverage',
  'e2eFuelPlanPostFuelCoverage',
  'e2eFuelPlanEnergySummaryToneCoverage',
  'e2eFuelPlanPostEnergyCoverage',
] as const

export type FuelPlanFullCoverageModule = (typeof FUEL_PLAN_FULL_COVERAGE_MODULES)[number]

export function countFuelPlanCoverageSuites(): number {
  return FUEL_PLAN_FULL_COVERAGE_MODULES.length
}

export function e2eFuelPlanFullBlockRange(): { from: number; to: number } {
  return { from: 412, to: 434 }
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
    isFuelPlanPostStackE2ECoverageComplete() &&
    isFuelPlanHistoryToneCoverageComplete() &&
    isTrainingPolishPostFuelClosed(432) &&
    unionFuelPlanCovers().includes('fuel-history-tone') &&
    unionFuelPlanCovers().includes('fuel-rotation-tone') &&
    isFuelPlanRotationToneCoverageComplete() &&
    isFuelPlanPostFuelE2ECoverageComplete() &&
    isTrainingPolishPostEnergyClosed(434) &&
    unionFuelPlanCovers().includes('fuel-energy-tone') &&
    isFuelPlanEnergySummaryToneCoverageComplete() &&
    isFuelPlanPostEnergyE2ECoverageComplete()
  )
}