/** Inventario Playwright del bloque E2E entrenamiento (oleadas 378–410). */
import { e2eFuelPlanSpecIds } from './e2eFuelPlanCoverage'
import { isE2ETrainingMegaGlobalCoverageComplete } from './e2eTrainingMegaGlobalCoverage'
import { isFuelPlanFullE2ECoverageComplete } from './e2eFuelPlanFullCoverage'
import { isFuelPlanScenarioCoverageComplete } from './e2eFuelPlanScenarioCoverage'
import { e2eFuelPlanHeadlineSpecIds } from './e2eFuelPlanHeadlineCoverage'
import { e2eFuelPlanNutritionSpecIds } from './e2eFuelPlanNutritionCoverage'
import { e2ePlanRotationSpecIds } from './e2ePlanRotationCoverage'
export type E2ETrainingCover =
  | 'gym-log'
  | 'fuel'
  | 'sync'
  | 'review'
  | 'fab'
  | 'banner'
  | 'fuel-prefill'
  | 'history'
  | 'plan-history'

export type E2ETrainingSpecEntry = {
  id: string
  file: string
  covers: readonly E2ETrainingCover[]
}

export const E2E_TRAINING_PLAYWRIGHT_SPECS: readonly E2ETrainingSpecEntry[] = [
  {
    id: 'workout-flow',
    file: 'e2e/workout-flow.spec.ts',
    covers: ['gym-log', 'review', 'banner'],
  },
  {
    id: 'training-full-flow',
    file: 'e2e/training-full-flow.spec.ts',
    covers: ['gym-log', 'sync', 'review'],
  },
  {
    id: 'workout-fuel-flow',
    file: 'e2e/workout-fuel-flow.spec.ts',
    covers: ['gym-log', 'fuel', 'banner', 'fuel-prefill'],
  },
  {
    id: 'training-mega-flow',
    file: 'e2e/training-mega-flow.spec.ts',
    covers: ['gym-log', 'fuel', 'sync', 'review', 'banner', 'fuel-prefill', 'plan-history'],
  },
  {
    id: 'workout-fab-flow',
    file: 'e2e/workout-fab-flow.spec.ts',
    covers: ['gym-log', 'fab'],
  },
  {
    id: 'workout-history-flow',
    file: 'e2e/workout-history-flow.spec.ts',
    covers: ['history', 'plan-history'],
  },
  {
    id: 'workout-plan-history-flow',
    file: 'e2e/workout-plan-history-flow.spec.ts',
    covers: ['gym-log', 'plan-history'],
  },
] as const

export function trainingE2EBlockRange(): { from: number; to: number } {
  return { from: 378, to: 410 }
}

/** Los 3 specs de rotación EntrenaPlan están en el inventario CI (oleada 410). */
export function e2eRotationSpecsCoveredInInventory(): boolean {
  const rotationIds = e2ePlanRotationSpecIds()
  return rotationIds.every((id) =>
    E2E_TRAINING_PLAYWRIGHT_SPECS.some((s) => s.id === id)
  )
}

/** Los 3 specs Fuel×EntrenaPlan están en el inventario CI (oleada 414). */
export function e2eFuelPlanSpecsCoveredInInventory(): boolean {
  const fuelPlanIds = e2eFuelPlanSpecIds()
  return fuelPlanIds.every((id) =>
    E2E_TRAINING_PLAYWRIGHT_SPECS.some((s) => s.id === id)
  )
}

/** Los 3 specs nutrición Fuel×EntrenaPlan están en el inventario CI (oleada 418). */
export function e2eFuelPlanNutritionSpecsCoveredInInventory(): boolean {
  const nutritionIds = e2eFuelPlanNutritionSpecIds()
  return nutritionIds.every((id) =>
    E2E_TRAINING_PLAYWRIGHT_SPECS.some((s) => s.id === id)
  )
}

/** Los 3 specs headline Fuel×EntrenaPlan están en el inventario CI (oleada 419). */
export function e2eFuelPlanHeadlineSpecsCoveredInInventory(): boolean {
  const headlineIds = e2eFuelPlanHeadlineSpecIds()
  return headlineIds.every((id) =>
    E2E_TRAINING_PLAYWRIGHT_SPECS.some((s) => s.id === id)
  )
}

/** Cobertura Fuel×plan + nutrición + headline completa (oleada 420). */
export function isE2EFuelPlanFullCoverageReady(): boolean {
  return isFuelPlanFullE2ECoverageComplete()
}

/** Cierre mega global 361–435 (oleada 435). */
export function isE2ETrainingMegaGlobalReady(): boolean {
  return isE2ETrainingMegaGlobalCoverageComplete()
}

export function countTrainingE2ESpecs(): number {
  return E2E_TRAINING_PLAYWRIGHT_SPECS.length
}

export function trainingMegaSpecEntry(): E2ETrainingSpecEntry {
  const mega = E2E_TRAINING_PLAYWRIGHT_SPECS.find((s) => s.id === 'training-mega-flow')
  if (!mega) throw new Error('training-mega-flow spec missing')
  return mega
}