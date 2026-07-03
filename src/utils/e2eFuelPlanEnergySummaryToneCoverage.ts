/** Inventario E2E tono Fuel×footer energía EntrenaPlan — 2 specs (oleada 433). */

export type E2EFuelPlanEnergySummaryToneCover = 'energy-fuel-tone' | 'harness' | 'aria'

export type E2EFuelPlanEnergySummaryToneSpecEntry = {
  id: string
  file: string
  oleada: number
  tone: 'under-fueled' | 'surplus'
  covers: readonly E2EFuelPlanEnergySummaryToneCover[]
}

export const E2E_FUEL_PLAN_ENERGY_SUMMARY_TONE_SPECS: readonly E2EFuelPlanEnergySummaryToneSpecEntry[] =
  [
    {
      id: 'training-mega-flow',
      file: 'e2e/training-mega-flow.spec.ts',
      oleada: 433,
      tone: 'under-fueled',
      covers: ['energy-fuel-tone', 'harness', 'aria'],
    },
    {
      id: 'workout-plan-history-flow',
      file: 'e2e/workout-plan-history-flow.spec.ts',
      oleada: 433,
      tone: 'surplus',
      covers: ['energy-fuel-tone', 'harness', 'aria'],
    },
  ] as const

export function countE2EFuelPlanEnergySummaryToneSpecs(): number {
  return E2E_FUEL_PLAN_ENERGY_SUMMARY_TONE_SPECS.length
}

export function e2eFuelPlanEnergySummaryToneBlockRange(): { from: number; to: number } {
  return { from: 433, to: 433 }
}

export function isFuelPlanEnergySummaryToneCoverageComplete(): boolean {
  return E2E_FUEL_PLAN_ENERGY_SUMMARY_TONE_SPECS.every((s) =>
    s.covers.includes('energy-fuel-tone')
  )
}

export function fuelPlanEnergySummaryToneSpecFileBasenames(): string[] {
  return E2E_FUEL_PLAN_ENERGY_SUMMARY_TONE_SPECS.map((s) =>
    s.file.replace(/^e2e\//, '')
  )
}