/** Inventario E2E tono PR×chip sesión FAB — 1 spec (oleada 437). */

export type E2EGymLogFabSessionPrCover = 'fab-session-pr-tone' | 'harness' | 'aria'

export type E2EGymLogFabSessionPrSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2EGymLogFabSessionPrCover[]
}

export const E2E_GYM_LOG_FAB_SESSION_PR_SPECS: readonly E2EGymLogFabSessionPrSpecEntry[] = [
  {
    id: 'workout-fab-flow',
    file: 'e2e/workout-fab-flow.spec.ts',
    oleada: 437,
    covers: ['fab-session-pr-tone', 'harness', 'aria'],
  },
] as const

export function countE2EGymLogFabSessionPrSpecs(): number {
  return E2E_GYM_LOG_FAB_SESSION_PR_SPECS.length
}

export function e2eGymLogFabSessionPrBlockRange(): { from: number; to: number } {
  return { from: 437, to: 437 }
}

export function isGymLogFabSessionPrCoverageComplete(): boolean {
  return E2E_GYM_LOG_FAB_SESSION_PR_SPECS.every((s) => s.covers.includes('fab-session-pr-tone'))
}

export function gymLogFabSessionPrSpecFileBasenames(): string[] {
  return E2E_GYM_LOG_FAB_SESSION_PR_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}