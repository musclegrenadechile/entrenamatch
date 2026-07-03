import { describe, expect, it } from 'vitest'
import {
  countWorkoutHistorySparklinePostV2CoverageModules,
  e2eWorkoutHistorySparklinePostV2BlockRange,
  isWorkoutHistorySparklinePostV2E2ECoverageComplete,
  WORKOUT_HISTORY_SPARKLINE_POST_V2_COVERAGE_MODULES,
} from './e2eWorkoutHistorySparklinePostV2Coverage'

describe('e2eWorkoutHistorySparklinePostV2Coverage', () => {
  it('inventario cierre sparkline historial v2 oleada 449', () => {
    expect(countWorkoutHistorySparklinePostV2CoverageModules()).toBe(2)
    expect(WORKOUT_HISTORY_SPARKLINE_POST_V2_COVERAGE_MODULES).toEqual([
      'workoutHistorySparklinePrToneDisplay',
      'e2eWorkoutHistorySparklinePrCoverage',
    ])
  })

  it('bloque 448–449 y cobertura completa', () => {
    expect(e2eWorkoutHistorySparklinePostV2BlockRange()).toEqual({ from: 448, to: 449 })
    expect(isWorkoutHistorySparklinePostV2E2ECoverageComplete()).toBe(true)
  })
})