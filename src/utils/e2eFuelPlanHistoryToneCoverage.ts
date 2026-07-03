/** Inventario E2E tono Fuel×hint historial EntrenaPlan — 2 specs (oleada 430). */

export type E2EFuelPlanHistoryToneCover = 'history-fuel-tone' | 'harness' | 'aria'

export type E2EFuelPlanHistoryToneSpecEntry = {
  id: string
  file: string
  oleada: number
  tone: 'under-fueled' | 'surplus'
  covers: readonly E2EFuelPlanHistoryToneCover[]
}

export const E2E_FUEL_PLAN_HISTORY_TONE_SPECS: readonly E2EFuelPlanHistoryToneSpecEntry[] = [
  {
    id: 'training-mega-flow',
    file: 'e2e/training-mega-flow.spec.ts',
    oleada: 430,
    tone: 'under-fueled',
    covers: ['history-fuel-tone', 'harness', 'aria'],
  },
  {
    id: 'workout-plan-history-flow',
    file: 'e2e/workout-plan-history-flow.spec.ts',
    oleada: 430,
    tone: 'surplus',
    covers: ['history-fuel-tone', 'harness', 'aria'],
  },
] as const

export function countE2EFuelPlanHistoryToneSpecs(): number {
  return E2E_FUEL_PLAN_HISTORY_TONE_SPECS.length
}

export function e2eFuelPlanHistoryToneBlockRange(): { from: number; to: number } {
  return { from: 430, to: 430 }
}

export function isFuelPlanHistoryToneCoverageComplete(): boolean {
  return E2E_FUEL_PLAN_HISTORY_TONE_SPECS.every((s) =>
    s.covers.includes('history-fuel-tone')
  )
}

export function fuelPlanHistoryToneSpecFileBasenames(): string[] {
  return E2E_FUEL_PLAN_HISTORY_TONE_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}