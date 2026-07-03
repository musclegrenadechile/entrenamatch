/** Inventario E2E borde escenario Fuel×EntrenaPlan — 3 specs (oleada 421). */

export type E2EFuelPlanScenarioCover = 'scenario' | 'border' | 'harness'

export type E2EFuelPlanScenarioSpecEntry = {
  id: string
  file: string
  oleada: number
  tone: 'under-fueled' | 'surplus' | 'deficit'
  expectedBorder: string
  covers: readonly E2EFuelPlanScenarioCover[]
}

export const E2E_FUEL_PLAN_SCENARIO_SPECS: readonly E2EFuelPlanScenarioSpecEntry[] = [
  {
    id: 'training-mega-flow',
    file: 'e2e/training-mega-flow.spec.ts',
    oleada: 421,
    tone: 'under-fueled',
    expectedBorder: 'em-v2-plan--under-fueled',
    covers: ['scenario', 'border', 'harness'],
  },
  {
    id: 'workout-plan-history-flow',
    file: 'e2e/workout-plan-history-flow.spec.ts',
    oleada: 421,
    tone: 'surplus',
    expectedBorder: 'em-v2-plan--surplus',
    covers: ['scenario', 'border', 'harness'],
  },
  {
    id: 'workout-fuel-flow',
    file: 'e2e/workout-fuel-flow.spec.ts',
    oleada: 421,
    tone: 'deficit',
    expectedBorder: 'em-v2-plan--deficit',
    covers: ['scenario', 'border', 'harness'],
  },
] as const

const REQUIRED_SCENARIO_TONES: readonly E2EFuelPlanScenarioSpecEntry['tone'][] = [
  'under-fueled',
  'surplus',
  'deficit',
]

export function countE2EFuelPlanScenarioSpecs(): number {
  return E2E_FUEL_PLAN_SCENARIO_SPECS.length
}

export function e2eFuelPlanScenarioBlockRange(): { from: number; to: number } {
  return { from: 421, to: 421 }
}

export function isFuelPlanScenarioCoverageComplete(): boolean {
  const tones = new Set(E2E_FUEL_PLAN_SCENARIO_SPECS.map((s) => s.tone))
  return REQUIRED_SCENARIO_TONES.every((t) => tones.has(t))
}

export function fuelPlanScenarioSpecFileBasenames(): string[] {
  return E2E_FUEL_PLAN_SCENARIO_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}