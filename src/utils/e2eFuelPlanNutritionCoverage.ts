/** Inventario E2E consolidado nutrición Fuel×EntrenaPlan — 3 specs (oleada 418). */

export type E2EFuelPlanNutritionCover = 'nutrition' | 'aria' | 'scenario' | 'nutrition-tone'

export type E2EFuelPlanNutritionSpecEntry = {
  id: string
  file: string
  oleada: number
  scenario: 'under-fueled' | 'surplus' | 'deficit'
  covers: readonly E2EFuelPlanNutritionCover[]
}

export const E2E_FUEL_PLAN_NUTRITION_SPECS: readonly E2EFuelPlanNutritionSpecEntry[] = [
  {
    id: 'training-mega-flow',
    file: 'e2e/training-mega-flow.spec.ts',
    oleada: 424,
    scenario: 'under-fueled',
    covers: ['nutrition', 'aria', 'scenario', 'nutrition-tone'],
  },
  {
    id: 'workout-plan-history-flow',
    file: 'e2e/workout-plan-history-flow.spec.ts',
    oleada: 424,
    scenario: 'surplus',
    covers: ['nutrition', 'aria', 'scenario', 'nutrition-tone'],
  },
  {
    id: 'workout-fuel-flow',
    file: 'e2e/workout-fuel-flow.spec.ts',
    oleada: 424,
    scenario: 'deficit',
    covers: ['nutrition', 'aria', 'scenario', 'nutrition-tone'],
  },
] as const

const REQUIRED_NUTRITION_SCENARIOS: readonly E2EFuelPlanNutritionSpecEntry['scenario'][] = [
  'under-fueled',
  'surplus',
  'deficit',
]

export function countE2EFuelPlanNutritionSpecs(): number {
  return E2E_FUEL_PLAN_NUTRITION_SPECS.length
}

export function e2eFuelPlanNutritionBlockRange(): { from: number; to: number } {
  return { from: 415, to: 424 }
}

export function e2eFuelPlanNutritionSpecIds(): string[] {
  return E2E_FUEL_PLAN_NUTRITION_SPECS.map((s) => s.id)
}

export function isFuelPlanNutritionCoverageComplete(): boolean {
  const scenarios = new Set(E2E_FUEL_PLAN_NUTRITION_SPECS.map((s) => s.scenario))
  return REQUIRED_NUTRITION_SCENARIOS.every((sc) => scenarios.has(sc))
}

export function unionFuelPlanNutritionCovers(): E2EFuelPlanNutritionCover[] {
  const all = new Set<E2EFuelPlanNutritionCover>()
  for (const spec of E2E_FUEL_PLAN_NUTRITION_SPECS) {
    for (const cover of spec.covers) all.add(cover)
  }
  return [...all]
}

/** Archivos Playwright ejecutados en CI e2e-smoke (oleada 418). */
export const E2E_FUEL_PLAN_NUTRITION_CI_FILES = E2E_FUEL_PLAN_NUTRITION_SPECS.map((s) => s.file)

export function fuelPlanNutritionSpecFileBasenames(): string[] {
  return E2E_FUEL_PLAN_NUTRITION_CI_FILES.map((f) => f.replace(/^e2e\//, ''))
}