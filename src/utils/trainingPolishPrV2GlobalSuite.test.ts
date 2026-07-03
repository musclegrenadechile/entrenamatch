import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPrV2GlobalUtils,
  isTrainingPolishPrV2GlobalClosed,
  TRAINING_POLISH_PR_V2_GLOBAL_UTILS,
  trainingPolishPrV2GlobalRange,
} from './trainingPolishPrV2GlobalSuite'

describe('trainingPolishPrV2GlobalSuite', () => {
  it('cierre global PR v2 oleada 444', () => {
    expect(countTrainingPolishPrV2GlobalUtils()).toBe(2)
    expect(trainingPolishPrV2GlobalRange()).toEqual({ from: 444, to: 444 })
    expect(TRAINING_POLISH_PR_V2_GLOBAL_UTILS.map((e) => e.id)).toEqual([
      'pr-v2-global-closure',
      'pr-v2-global-e2e',
    ])
    expect(isTrainingPolishPrV2GlobalClosed()).toBe(true)
    expect(isTrainingPolishPrV2GlobalClosed(443)).toBe(false)
  })
})