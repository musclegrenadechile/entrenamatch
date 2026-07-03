/** Inventario E2E tono Fuel×chip rotación EntrenaPlan — 2 specs (oleada 431). */

export type E2EFuelPlanRotationToneCover = 'rotation-fuel-tone' | 'harness' | 'aria'

export type E2EFuelPlanRotationToneSpecEntry = {
  id: string
  file: string
  oleada: number
  tone: 'under-fueled' | 'surplus'
  covers: readonly E2EFuelPlanRotationToneCover[]
}

export const E2E_FUEL_PLAN_ROTATION_TONE_SPECS: readonly E2EFuelPlanRotationToneSpecEntry[] = [
  {
    id: 'training-mega-flow',
    file: 'e2e/training-mega-flow.spec.ts',
    oleada: 431,
    tone: 'under-fueled',
    covers: ['rotation-fuel-tone', 'harness', 'aria'],
  },
  {
    id: 'workout-plan-history-flow',
    file: 'e2e/workout-plan-history-flow.spec.ts',
    oleada: 431,
    tone: 'surplus',
    covers: ['rotation-fuel-tone', 'harness', 'aria'],
  },
] as const

export function countE2EFuelPlanRotationToneSpecs(): number {
  return E2E_FUEL_PLAN_ROTATION_TONE_SPECS.length
}

export function e2eFuelPlanRotationToneBlockRange(): { from: number; to: number } {
  return { from: 431, to: 431 }
}

export function isFuelPlanRotationToneCoverageComplete(): boolean {
  return E2E_FUEL_PLAN_ROTATION_TONE_SPECS.every((s) =>
    s.covers.includes('rotation-fuel-tone')
  )
}

export function fuelPlanRotationToneSpecFileBasenames(): string[] {
  return E2E_FUEL_PLAN_ROTATION_TONE_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}