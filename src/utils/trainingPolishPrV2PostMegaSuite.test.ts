import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPrV2PostMegaUtils,
  isTrainingPolishPrV2PostMegaClosed,
  TRAINING_POLISH_PR_V2_POST_MEGA_UTILS,
  trainingPolishPrV2PostMegaRange,
} from './trainingPolishPrV2PostMegaSuite'

describe('trainingPolishPrV2PostMegaSuite', () => {
  it('cierre post-mega PR v2 oleada 453', () => {
    expect(countTrainingPolishPrV2PostMegaUtils()).toBe(2)
    expect(trainingPolishPrV2PostMegaRange()).toEqual({ from: 453, to: 453 })
    expect(TRAINING_POLISH_PR_V2_POST_MEGA_UTILS.map((e) => e.module)).toEqual([
      'trainingPrV2PostMegaClosure',
      'e2eTrainingPrV2PostMegaCoverage',
    ])
    expect(isTrainingPolishPrV2PostMegaClosed()).toBe(true)
    expect(isTrainingPolishPrV2PostMegaClosed(452)).toBe(false)
  })
})