/** Inventario E2E tono PR×sparkline historial — 1 spec (oleada 448). */

export type E2EWorkoutHistorySparklinePrCover = 'sparkline-pr-tone' | 'harness' | 'aria'

export type E2EWorkoutHistorySparklinePrSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2EWorkoutHistorySparklinePrCover[]
}

export const E2E_WORKOUT_HISTORY_SPARKLINE_PR_SPECS: readonly E2EWorkoutHistorySparklinePrSpecEntry[] =
  [
    {
      id: 'workout-history-flow',
      file: 'e2e/workout-history-flow.spec.ts',
      oleada: 448,
      covers: ['sparkline-pr-tone', 'harness', 'aria'],
    },
  ] as const

export function countE2EWorkoutHistorySparklinePrSpecs(): number {
  return E2E_WORKOUT_HISTORY_SPARKLINE_PR_SPECS.length
}

export function e2eWorkoutHistorySparklinePrBlockRange(): { from: number; to: number } {
  return { from: 448, to: 448 }
}

export function isWorkoutHistorySparklinePrCoverageComplete(): boolean {
  return E2E_WORKOUT_HISTORY_SPARKLINE_PR_SPECS.every((s) =>
    s.covers.includes('sparkline-pr-tone')
  )
}

export function workoutHistorySparklinePrSpecFileBasenames(): string[] {
  return E2E_WORKOUT_HISTORY_SPARKLINE_PR_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}