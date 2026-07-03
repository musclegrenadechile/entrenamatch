/** Registro E2E gym-log v2 — union de specs session-pr y fab-session-pr (oleada 438). */
import { E2E_GYM_LOG_FAB_SESSION_PR_SPECS } from './e2eGymLogFabSessionPrCoverage'
import { E2E_GYM_LOG_SESSION_PR_SPECS } from './e2eGymLogSessionPrCoverage'

export type E2EGymLogCover = 'session-pr-tone' | 'fab-session-pr-tone' | 'harness' | 'aria'

export type E2EGymLogSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2EGymLogCover[]
}

export const E2E_GYM_LOG_SPECS: readonly E2EGymLogSpecEntry[] = [
  ...E2E_GYM_LOG_SESSION_PR_SPECS,
  ...E2E_GYM_LOG_FAB_SESSION_PR_SPECS,
] as const

export function countE2EGymLogSpecs(): number {
  return E2E_GYM_LOG_SPECS.length
}

export function unionGymLogCovers(): E2EGymLogCover[] {
  const all = new Set<E2EGymLogCover>()
  for (const spec of E2E_GYM_LOG_SPECS) {
    for (const cover of spec.covers) all.add(cover)
  }
  return [...all]
}

export function gymLogSpecFileBasenames(): string[] {
  return E2E_GYM_LOG_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}