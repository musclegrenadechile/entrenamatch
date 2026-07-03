import { describe, expect, it } from 'vitest'
import {
  countTrainingPrV2PostMegaGlobalBlockClosures,
  isTrainingPrV2PostMegaGlobalClosureComplete,
  TRAINING_PR_V2_POST_MEGA_GLOBAL_BLOCK_CLOSURES,
  trainingPrV2PostMegaGlobalBlockRange,
} from './trainingPrV2PostMegaGlobalClosure'

describe('trainingPrV2PostMegaGlobalClosure', () => {
  it('inventario cierre post-mega global PR v2 oleada 454', () => {
    expect(trainingPrV2PostMegaGlobalBlockRange()).toEqual({ from: 451, to: 454 })
    expect(countTrainingPrV2PostMegaGlobalBlockClosures()).toBe(3)
    expect(TRAINING_PR_V2_POST_MEGA_GLOBAL_BLOCK_CLOSURES.map((b) => b.block)).toEqual([
      'post-pr-mega',
      'history-v2-global-full',
      'mega-post-pr-full-v2',
    ])
    expect(isTrainingPrV2PostMegaGlobalClosureComplete()).toBe(true)
    expect(isTrainingPrV2PostMegaGlobalClosureComplete(453)).toBe(false)
  })
})