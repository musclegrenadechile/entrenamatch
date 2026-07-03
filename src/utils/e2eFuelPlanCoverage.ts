/** Inventario E2E consolidado Fuel×EntrenaPlan — 3 specs (oleada 414). */

export type E2EFuelPlanCover =
  | 'fuel-hint'
  | 'fuel-chip'
  | 'fuel-aria'
  | 'fuel-tone'
  | 'fuel-nutrition'
  | 'fuel-headline'
  | 'fuel-scenario'
  | 'fuel-row-tone'

export type E2EFuelPlanSpecEntry = {
  id: string
  file: string
  oleada: number
  scenario: 'under-fueled' | 'surplus' | 'deficit'
  covers: readonly E2EFuelPlanCover[]
}

export const E2E_FUEL_PLAN_SPECS: readonly E2EFuelPlanSpecEntry[] = [
  {
    id: 'training-mega-flow',
    file: 'e2e/training-mega-flow.spec.ts',
    oleada: 412,
    scenario: 'under-fueled',
    covers: [
      'fuel-hint',
      'fuel-aria',
      'fuel-tone',
      'fuel-nutrition',
      'fuel-headline',
      'fuel-scenario',
      'fuel-row-tone',
    ],
  },
  {
    id: 'workout-plan-history-flow',
    file: 'e2e/workout-plan-history-flow.spec.ts',
    oleada: 413,
    scenario: 'surplus',
    covers: [
      'fuel-hint',
      'fuel-chip',
      'fuel-aria',
      'fuel-tone',
      'fuel-nutrition',
      'fuel-headline',
      'fuel-scenario',
      'fuel-row-tone',
    ],
  },
  {
    id: 'workout-fuel-flow',
    file: 'e2e/workout-fuel-flow.spec.ts',
    oleada: 414,
    scenario: 'deficit',
    covers: [
      'fuel-hint',
      'fuel-chip',
      'fuel-aria',
      'fuel-tone',
      'fuel-nutrition',
      'fuel-headline',
      'fuel-scenario',
      'fuel-row-tone',
    ],
  },
] as const

const REQUIRED_FUEL_PLAN_COVERS: readonly E2EFuelPlanCover[] = [
  'fuel-hint',
  'fuel-chip',
  'fuel-aria',
]

export function countE2EFuelPlanSpecs(): number {
  return E2E_FUEL_PLAN_SPECS.length
}

export function e2eFuelPlanBlockRange(): { from: number; to: number } {
  return { from: 412, to: 422 }
}

export function fuelPlanNutritionSpecIds(): string[] {
  return E2E_FUEL_PLAN_SPECS.filter((s) => s.covers.includes('fuel-nutrition')).map(
    (s) => s.id
  )
}

export function isFuelPlanNutritionE2ECovered(): boolean {
  return fuelPlanNutritionSpecIds().length >= 2
}

/** Trilogía nutrición: under-fueled + surplus + déficit (oleada 417). */
export function isFuelPlanNutritionE2ETrilogyComplete(): boolean {
  return fuelPlanNutritionSpecIds().length >= 3
}

export function e2eFuelPlanSpecIds(): string[] {
  return E2E_FUEL_PLAN_SPECS.map((s) => s.id)
}

export function isFuelPlanE2ECoverageComplete(
  covered: readonly E2EFuelPlanCover[]
): boolean {
  return REQUIRED_FUEL_PLAN_COVERS.every((c) => covered.includes(c))
}

export function unionFuelPlanCovers(): E2EFuelPlanCover[] {
  const all = new Set<E2EFuelPlanCover>()
  for (const spec of E2E_FUEL_PLAN_SPECS) {
    for (const cover of spec.covers) all.add(cover)
  }
  return [...all]
}

/** Archivos Playwright ejecutados en CI e2e-smoke (oleada 414). */
export const E2E_FUEL_PLAN_CI_FILES = E2E_FUEL_PLAN_SPECS.map((s) => s.file)

export function fuelPlanSpecFileBasenames(): string[] {
  return E2E_FUEL_PLAN_CI_FILES.map((f) => f.replace(/^e2e\//, ''))
}