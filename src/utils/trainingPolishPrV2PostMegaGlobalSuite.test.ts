import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPrV2PostMegaGlobalUtils,
  isTrainingPolishPrV2PostMegaGlobalClosed,
  TRAINING_POLISH_PR_V2_POST_MEGA_GLOBAL_UTILS,
  trainingPolishPrV2PostMegaGlobalRange,
} from './trainingPolishPrV2PostMegaGlobalSuite'

describe('trainingPolishPrV2PostMegaGlobalSuite', () => {
  it('cierre post-mega global PR v2 oleada 454', () => {
    expect(countTrainingPolishPrV2PostMegaGlobalUtils()).toBe(2)
    expect(trainingPolishPrV2PostMegaGlobalRange()).toEqual({ from: 454, to: 454 })
    expect(TRAINING_POLISH_PR_V2_POST_MEGA_GLOBAL_UTILS.map((e) => e.module)).toEqual([
      'trainingPrV2PostMegaGlobalClosure',
      'e2eTrainingPrV2PostMegaGlobalCoverage',
    ])
    expect(isTrainingPolishPrV2PostMegaGlobalClosed()).toBe(true)
    expect(isTrainingPolishPrV2PostMegaGlobalClosed(453)).toBe(false)
  })
})