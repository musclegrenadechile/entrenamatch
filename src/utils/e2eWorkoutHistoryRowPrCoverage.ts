/** Inventario E2E tono PR×fila historial — 1 spec (oleada 440). */

export type E2EWorkoutHistoryRowPrCover = 'history-row-pr-tone' | 'harness' | 'aria'

export type E2EWorkoutHistoryRowPrSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2EWorkoutHistoryRowPrCover[]
}

export const E2E_WORKOUT_HISTORY_ROW_PR_SPECS: readonly E2EWorkoutHistoryRowPrSpecEntry[] = [
  {
    id: 'workout-history-flow',
    file: 'e2e/workout-history-flow.spec.ts',
    oleada: 440,
    covers: ['history-row-pr-tone', 'harness', 'aria'],
  },
] as const

export function countE2EWorkoutHistoryRowPrSpecs(): number {
  return E2E_WORKOUT_HISTORY_ROW_PR_SPECS.length
}

export function e2eWorkoutHistoryRowPrBlockRange(): { from: number; to: number } {
  return { from: 440, to: 440 }
}

export function isWorkoutHistoryRowPrCoverageComplete(): boolean {
  return E2E_WORKOUT_HISTORY_ROW_PR_SPECS.every((s) => s.covers.includes('history-row-pr-tone'))
}

export function workoutHistoryRowPrSpecFileBasenames(): string[] {
  return E2E_WORKOUT_HISTORY_ROW_PR_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}