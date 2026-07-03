/** Inventario E2E stack tono Fuel×EntrenaPlan — 3 specs (oleada 423). */

export type E2EFuelPlanToneCover =
  | 'tone-stack'
  | 'harness'
  | 'scenario'
  | 'tone-expected'
  | 'tone-aria'
  | 'tone-card'
  | 'tone-full'

export type E2EFuelPlanToneSpecEntry = {
  id: string
  file: string
  oleada: number
  tone: 'under-fueled' | 'surplus' | 'deficit'
  covers: readonly E2EFuelPlanToneCover[]
}

export const E2E_FUEL_PLAN_TONE_SPECS: readonly E2EFuelPlanToneSpecEntry[] = [
  {
    id: 'training-mega-flow',
    file: 'e2e/training-mega-flow.spec.ts',
    oleada: 428,
    tone: 'under-fueled',
    covers: [
      'tone-stack',
      'harness',
      'scenario',
      'tone-expected',
      'tone-aria',
      'tone-card',
      'tone-full',
    ],
  },
  {
    id: 'workout-plan-history-flow',
    file: 'e2e/workout-plan-history-flow.spec.ts',
    oleada: 428,
    tone: 'surplus',
    covers: [
      'tone-stack',
      'harness',
      'scenario',
      'tone-expected',
      'tone-aria',
      'tone-card',
      'tone-full',
    ],
  },
  {
    id: 'workout-fuel-flow',
    file: 'e2e/workout-fuel-flow.spec.ts',
    oleada: 428,
    tone: 'deficit',
    covers: [
      'tone-stack',
      'harness',
      'scenario',
      'tone-expected',
      'tone-aria',
      'tone-card',
      'tone-full',
    ],
  },
] as const

const REQUIRED_TONE_SCENARIOS: readonly E2EFuelPlanToneSpecEntry['tone'][] = [
  'under-fueled',
  'surplus',
  'deficit',
]

export function countE2EFuelPlanToneSpecs(): number {
  return E2E_FUEL_PLAN_TONE_SPECS.length
}

export function e2eFuelPlanToneBlockRange(): { from: number; to: number } {
  return { from: 421, to: 428 }
}

export function isFuelPlanToneFullCoverageComplete(): boolean {
  return E2E_FUEL_PLAN_TONE_SPECS.every((s) => s.covers.includes('tone-full'))
}

export function isFuelPlanToneCardCoverageComplete(): boolean {
  return E2E_FUEL_PLAN_TONE_SPECS.every((s) => s.covers.includes('tone-card'))
}

export function isFuelPlanToneAriaCoverageComplete(): boolean {
  return E2E_FUEL_PLAN_TONE_SPECS.every((s) => s.covers.includes('tone-aria'))
}

export function isFuelPlanToneExpectedCoverageComplete(): boolean {
  return E2E_FUEL_PLAN_TONE_SPECS.every((s) => s.covers.includes('tone-expected'))
}

export function isFuelPlanToneCoverageComplete(): boolean {
  const tones = new Set(E2E_FUEL_PLAN_TONE_SPECS.map((s) => s.tone))
  return REQUIRED_TONE_SCENARIOS.every((t) => tones.has(t))
}

export function fuelPlanToneSpecFileBasenames(): string[] {
  return E2E_FUEL_PLAN_TONE_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}