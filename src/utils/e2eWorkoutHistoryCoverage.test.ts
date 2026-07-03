import { describe, expect, it } from 'vitest'
import {
  countE2EWorkoutHistorySpecs,
  E2E_WORKOUT_HISTORY_SPECS,
  unionWorkoutHistoryCovers,
  workoutHistorySpecFileBasenames,
} from './e2eWorkoutHistoryCoverage'

describe('e2eWorkoutHistoryCoverage', () => {
  it('union historial v2 specs oleada 440', () => {
    expect(countE2EWorkoutHistorySpecs()).toBe(1)
    expect(E2E_WORKOUT_HISTORY_SPECS.map((s) => s.id)).toEqual(['workout-history-flow'])
    expect(unionWorkoutHistoryCovers().sort()).toEqual(
      ['aria', 'harness', 'history-row-pr-tone'].sort()
    )
    expect(workoutHistorySpecFileBasenames()).toEqual(['workout-history-flow.spec.ts'])
  })
})