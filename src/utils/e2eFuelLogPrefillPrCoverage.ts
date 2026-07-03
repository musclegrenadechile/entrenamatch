/** Inventario E2E tono PR×chip prefill Fuel — 1 spec (oleada 441). */

export type E2EFuelLogPrefillPrCover = 'fuel-prefill-pr-tone' | 'harness' | 'aria'

export type E2EFuelLogPrefillPrSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2EFuelLogPrefillPrCover[]
}

export const E2E_FUEL_LOG_PREFILL_PR_SPECS: readonly E2EFuelLogPrefillPrSpecEntry[] = [
  {
    id: 'workout-fuel-flow',
    file: 'e2e/workout-fuel-flow.spec.ts',
    oleada: 441,
    covers: ['fuel-prefill-pr-tone', 'harness', 'aria'],
  },
] as const

export function countE2EFuelLogPrefillPrSpecs(): number {
  return E2E_FUEL_LOG_PREFILL_PR_SPECS.length
}

export function e2eFuelLogPrefillPrBlockRange(): { from: number; to: number } {
  return { from: 441, to: 441 }
}

export function isFuelLogPrefillPrCoverageComplete(): boolean {
  return E2E_FUEL_LOG_PREFILL_PR_SPECS.every((s) => s.covers.includes('fuel-prefill-pr-tone'))
}

export function fuelLogPrefillPrSpecFileBasenames(): string[] {
  return E2E_FUEL_LOG_PREFILL_PR_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}