import { describe, expect, it } from 'vitest'
import {
  countE2EWorkoutHistorySparklineSpecs,
  E2E_WORKOUT_HISTORY_SPARKLINE_SPECS,
  unionWorkoutHistorySparklineCovers,
  workoutHistorySparklineSpecFileBasenames,
} from './e2eWorkoutHistorySparklineCoverage'

describe('e2eWorkoutHistorySparklineCoverage', () => {
  it('union sparkline historial v2 specs oleada 448', () => {
    expect(countE2EWorkoutHistorySparklineSpecs()).toBe(1)
    expect(E2E_WORKOUT_HISTORY_SPARKLINE_SPECS.map((s) => s.id)).toEqual(['workout-history-flow'])
    expect(unionWorkoutHistorySparklineCovers().sort()).toEqual(
      ['aria', 'harness', 'sparkline-pr-tone'].sort()
    )
    expect(workoutHistorySparklineSpecFileBasenames()).toEqual(['workout-history-flow.spec.ts'])
  })
})