import { describe, expect, it } from 'vitest'
import {
  countTrainingMegaGlobalPhaseClosures,
  isTrainingMegaGlobalClosureComplete,
  TRAINING_MEGA_GLOBAL_PHASE_CLOSURES,
  trainingMegaGlobalBlockRange,
} from './trainingMegaGlobalClosure'

describe('trainingMegaGlobalClosure', () => {
  it('inventario cierre mega global oleada 435', () => {
    expect(trainingMegaGlobalBlockRange()).toEqual({ from: 361, to: 435 })
    expect(countTrainingMegaGlobalPhaseClosures()).toBe(7)
    expect(TRAINING_MEGA_GLOBAL_PHASE_CLOSURES.map((p) => p.phase)).toEqual([
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
    ])
    expect(isTrainingMegaGlobalClosureComplete()).toBe(true)
    expect(isTrainingMegaGlobalClosureComplete(434)).toBe(false)
  })
})