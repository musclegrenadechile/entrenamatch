import { describe, expect, it } from 'vitest'
import {
  countTrainingWorkoutHistoryV2BlockClosures,
  isTrainingWorkoutHistoryV2GlobalClosureComplete,
  TRAINING_WORKOUT_HISTORY_V2_BLOCK_CLOSURES,
  trainingWorkoutHistoryV2GlobalBlockRange,
} from './trainingWorkoutHistoryV2GlobalClosure'

describe('trainingWorkoutHistoryV2GlobalClosure', () => {
  it('inventario cierre global historial v2 oleada 452', () => {
    expect(trainingWorkoutHistoryV2GlobalBlockRange()).toEqual({ from: 440, to: 449 })
    expect(countTrainingWorkoutHistoryV2BlockClosures()).toBe(2)
    expect(TRAINING_WORKOUT_HISTORY_V2_BLOCK_CLOSURES.map((b) => b.block)).toEqual([
      'history-row-v2',
      'history-sparkline-v2',
    ])
    expect(isTrainingWorkoutHistoryV2GlobalClosureComplete()).toBe(true)
    expect(isTrainingWorkoutHistoryV2GlobalClosureComplete(451)).toBe(false)
  })
})