/** Inventario E2E consolidado headline Fuel×EntrenaPlan — 3 specs (oleada 419). */

export type E2EFuelPlanHeadlineCover = 'headline' | 'aria' | 'tone' | 'scenario'

export type E2EFuelPlanHeadlineSpecEntry = {
  id: string
  file: string
  oleada: number
  scenario: 'under-fueled' | 'surplus' | 'deficit'
  covers: readonly E2EFuelPlanHeadlineCover[]
}

export const E2E_FUEL_PLAN_HEADLINE_SPECS: readonly E2EFuelPlanHeadlineSpecEntry[] = [
  {
    id: 'training-mega-flow',
    file: 'e2e/training-mega-flow.spec.ts',
    oleada: 419,
    scenario: 'under-fueled',
    covers: ['headline', 'aria', 'tone', 'scenario'],
  },
  {
    id: 'workout-plan-history-flow',
    file: 'e2e/workout-plan-history-flow.spec.ts',
    oleada: 418,
    scenario: 'surplus',
    covers: ['headline', 'aria', 'tone', 'scenario'],
  },
  {
    id: 'workout-fuel-flow',
    file: 'e2e/workout-fuel-flow.spec.ts',
    oleada: 419,
    scenario: 'deficit',
    covers: ['headline', 'aria', 'tone', 'scenario'],
  },
] as const

const REQUIRED_HEADLINE_SCENARIOS: readonly E2EFuelPlanHeadlineSpecEntry['scenario'][] = [
  'under-fueled',
  'surplus',
  'deficit',
]

export function countE2EFuelPlanHeadlineSpecs(): number {
  return E2E_FUEL_PLAN_HEADLINE_SPECS.length
}

export function e2eFuelPlanHeadlineBlockRange(): { from: number; to: number } {
  return { from: 418, to: 419 }
}

export function e2eFuelPlanHeadlineSpecIds(): string[] {
  return E2E_FUEL_PLAN_HEADLINE_SPECS.map((s) => s.id)
}

export function isFuelPlanHeadlineCoverageComplete(): boolean {
  const scenarios = new Set(E2E_FUEL_PLAN_HEADLINE_SPECS.map((s) => s.scenario))
  return REQUIRED_HEADLINE_SCENARIOS.every((sc) => scenarios.has(sc))
}

export function unionFuelPlanHeadlineCovers(): E2EFuelPlanHeadlineCover[] {
  const all = new Set<E2EFuelPlanHeadlineCover>()
  for (const spec of E2E_FUEL_PLAN_HEADLINE_SPECS) {
    for (const cover of spec.covers) all.add(cover)
  }
  return [...all]
}

/** Archivos Playwright ejecutados en CI e2e-smoke (oleada 419). */
export const E2E_FUEL_PLAN_HEADLINE_CI_FILES = E2E_FUEL_PLAN_HEADLINE_SPECS.map((s) => s.file)

export function fuelPlanHeadlineSpecFileBasenames(): string[] {
  return E2E_FUEL_PLAN_HEADLINE_CI_FILES.map((f) => f.replace(/^e2e\//, ''))
}