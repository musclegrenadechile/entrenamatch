import { describe, expect, it } from 'vitest'
import {
  countTrainingPrV2BlockClosures,
  isTrainingPrV2GlobalClosureComplete,
  TRAINING_PR_V2_BLOCK_CLOSURES,
  trainingPrV2GlobalBlockRange,
} from './trainingPrV2GlobalClosure'

describe('trainingPrV2GlobalClosure', () => {
  it('inventario cierre global PR v2 oleada 444', () => {
    expect(trainingPrV2GlobalBlockRange()).toEqual({ from: 436, to: 444 })
    expect(countTrainingPrV2BlockClosures()).toBe(3)
    expect(TRAINING_PR_V2_BLOCK_CLOSURES.map((b) => b.block)).toEqual([
      'gym-log-v2',
      'post-workout-v2',
      'history-v2',
    ])
    expect(isTrainingPrV2GlobalClosureComplete()).toBe(true)
    expect(isTrainingPrV2GlobalClosureComplete(443)).toBe(false)
  })
})