import { describe, expect, it } from 'vitest'
import {
  countTrainingPrV2PostMegaBlockClosures,
  isTrainingPrV2PostMegaClosureComplete,
  TRAINING_PR_V2_POST_MEGA_BLOCK_CLOSURES,
  trainingPrV2PostMegaBlockRange,
} from './trainingPrV2PostMegaClosure'

describe('trainingPrV2PostMegaClosure', () => {
  it('inventario cierre post-mega PR v2 oleada 453', () => {
    expect(trainingPrV2PostMegaBlockRange()).toEqual({ from: 451, to: 453 })
    expect(countTrainingPrV2PostMegaBlockClosures()).toBe(2)
    expect(TRAINING_PR_V2_POST_MEGA_BLOCK_CLOSURES.map((b) => b.block)).toEqual([
      'post-pr-mega',
      'history-v2-global',
    ])
    expect(isTrainingPrV2PostMegaClosureComplete()).toBe(true)
    expect(isTrainingPrV2PostMegaClosureComplete(452)).toBe(false)
  })
})