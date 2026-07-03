import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishMegaGlobalUtils,
  isTrainingPolishMegaGlobalClosed,
  TRAINING_POLISH_MEGA_GLOBAL_UTILS,
  trainingPolishMegaGlobalRange,
} from './trainingPolishMegaGlobalSuite'

describe('trainingPolishMegaGlobalSuite', () => {
  it('cierre mega global oleada 435', () => {
    expect(countTrainingPolishMegaGlobalUtils()).toBe(2)
    expect(trainingPolishMegaGlobalRange()).toEqual({ from: 435, to: 435 })
    expect(TRAINING_POLISH_MEGA_GLOBAL_UTILS.map((e) => e.id)).toEqual([
      'mega-global-closure',
      'mega-global-e2e',
    ])
    expect(isTrainingPolishMegaGlobalClosed()).toBe(true)
    expect(isTrainingPolishMegaGlobalClosed(434)).toBe(false)
  })
})