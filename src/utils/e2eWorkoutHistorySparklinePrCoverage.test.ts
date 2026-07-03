import { describe, expect, it } from 'vitest'
import {
  countE2EWorkoutHistorySparklinePrSpecs,
  e2eWorkoutHistorySparklinePrBlockRange,
  E2E_WORKOUT_HISTORY_SPARKLINE_PR_SPECS,
  isWorkoutHistorySparklinePrCoverageComplete,
  workoutHistorySparklinePrSpecFileBasenames,
} from './e2eWorkoutHistorySparklinePrCoverage'

describe('e2eWorkoutHistorySparklinePrCoverage', () => {
  it('inventario 1 spec workout-history-flow oleada 448', () => {
    expect(countE2EWorkoutHistorySparklinePrSpecs()).toBe(1)
    expect(E2E_WORKOUT_HISTORY_SPARKLINE_PR_SPECS[0].id).toBe('workout-history-flow')
    expect(workoutHistorySparklinePrSpecFileBasenames()).toEqual(['workout-history-flow.spec.ts'])
  })

  it('bloque oleada 448 y cobertura completa', () => {
    expect(e2eWorkoutHistorySparklinePrBlockRange()).toEqual({ from: 448, to: 448 })
    expect(isWorkoutHistorySparklinePrCoverageComplete()).toBe(true)
  })
})