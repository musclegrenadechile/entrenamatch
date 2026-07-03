import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPrV2PostMegaUtils,
  isTrainingPolishPrV2PostMegaClosed,
  TRAINING_POLISH_PR_V2_POST_MEGA_UTILS,
  trainingPolishPrV2PostMegaRange,
} from './trainingPolishPrV2PostMegaSuite'

describe('trainingPolishPrV2PostMegaSuite', () => {
  it('cierre post-mega PR v2 oleadas 453–454', () => {
    expect(countTrainingPolishPrV2PostMegaUtils()).toBe(3)
    expect(TRAINING_POLISH_PR_V2_POST_MEGA_UTILS[2].module).toBe(
      'trainingPolishPrV2PostMegaGlobalSuite'
    )
    expect(trainingPolishPrV2PostMegaRange()).toEqual({ from: 453, to: 454 })
    expect(TRAINING_POLISH_PR_V2_POST_MEGA_UTILS.map((e) => e.module)).toEqual([
      'trainingPrV2PostMegaClosure',
      'e2eTrainingPrV2PostMegaCoverage',
      'trainingPolishPrV2PostMegaGlobalSuite',
    ])
    expect(isTrainingPolishPrV2PostMegaClosed()).toBe(true)
    expect(isTrainingPolishPrV2PostMegaClosed(452)).toBe(false)
  })
})