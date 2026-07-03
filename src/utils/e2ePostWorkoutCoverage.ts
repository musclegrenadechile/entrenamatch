/** Registro E2E post-entreno v2 — union de specs banner-pr y fuel-prefill-pr (oleada 442). */
import { E2E_FUEL_LOG_PREFILL_PR_SPECS } from './e2eFuelLogPrefillPrCoverage'
import { E2E_WORKOUT_SAVE_BANNER_PR_SPECS } from './e2eWorkoutSaveBannerPrCoverage'

export type E2EPostWorkoutCover =
  | 'banner-pr-tone'
  | 'fuel-prefill-pr-tone'
  | 'harness'
  | 'aria'

export type E2EPostWorkoutSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2EPostWorkoutCover[]
}

export const E2E_POST_WORKOUT_SPECS: readonly E2EPostWorkoutSpecEntry[] = [
  ...E2E_WORKOUT_SAVE_BANNER_PR_SPECS,
  ...E2E_FUEL_LOG_PREFILL_PR_SPECS,
] as const

export function countE2EPostWorkoutSpecs(): number {
  return E2E_POST_WORKOUT_SPECS.length
}

export function unionPostWorkoutCovers(): E2EPostWorkoutCover[] {
  const all = new Set<E2EPostWorkoutCover>()
  for (const spec of E2E_POST_WORKOUT_SPECS) {
    for (const cover of spec.covers) all.add(cover)
  }
  return [...all]
}

export function postWorkoutSpecFileBasenames(): string[] {
  return E2E_POST_WORKOUT_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}