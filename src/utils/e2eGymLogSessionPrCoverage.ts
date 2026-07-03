/** Inventario E2E tono PR×chip sesión gym-log — 1 spec (oleada 436). */

export type E2EGymLogSessionPrCover = 'session-pr-tone' | 'harness' | 'aria'

export type E2EGymLogSessionPrSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2EGymLogSessionPrCover[]
}

export const E2E_GYM_LOG_SESSION_PR_SPECS: readonly E2EGymLogSessionPrSpecEntry[] = [
  {
    id: 'workout-flow',
    file: 'e2e/workout-flow.spec.ts',
    oleada: 436,
    covers: ['session-pr-tone', 'harness', 'aria'],
  },
] as const

export function countE2EGymLogSessionPrSpecs(): number {
  return E2E_GYM_LOG_SESSION_PR_SPECS.length
}

export function e2eGymLogSessionPrBlockRange(): { from: number; to: number } {
  return { from: 436, to: 436 }
}

export function isGymLogSessionPrCoverageComplete(): boolean {
  return E2E_GYM_LOG_SESSION_PR_SPECS.every((s) => s.covers.includes('session-pr-tone'))
}

export function gymLogSessionPrSpecFileBasenames(): string[] {
  return E2E_GYM_LOG_SESSION_PR_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}