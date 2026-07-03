import { describe, expect, it } from 'vitest'
import {
  areTrainingPolishSubBlocksClosed,
  countTrainingPolishBlocks,
  countTrainingPolishOleadas,
  isTrainingPolishBlockClosed,
  TRAINING_POLISH_BLOCKS,
  trainingPolishBlockById,
  trainingPolishMegaRange,
} from './trainingPolishSuite'

describe('trainingPolishSuite', () => {
  it('mega-inventario 5 bloques oleadas 383–409', () => {
    expect(countTrainingPolishBlocks()).toBe(5)
    expect(trainingPolishMegaRange()).toEqual({ from: 383, to: 409 })
    expect(countTrainingPolishOleadas()).toBe(27)
    expect(TRAINING_POLISH_BLOCKS.map((b) => b.id)).toEqual([
      'gym-log-live',
      'fab-session',
      'post-workout',
      'history',
      'entrena-plan',
    ])
  })

  it('trainingPolishBlockById', () => {
    const history = trainingPolishBlockById('history')
    expect(history?.closedOleada).toBe(397)
    expect(history?.suiteModule).toBe('workoutHistoryTrainingSuite')
    const fab = trainingPolishBlockById('fab-session')
    expect(fab?.range).toEqual({ from: 387, to: 389 })
    const plan = trainingPolishBlockById('entrena-plan')
    expect(plan?.range).toEqual({ from: 401, to: 409 })
    expect(plan?.closedOleada).toBe(409)
  })

  it('cierre pulido II oleadas 383–409 (oleada 410)', () => {
    expect(isTrainingPolishBlockClosed()).toBe(true)
    expect(isTrainingPolishBlockClosed(409)).toBe(false)
    expect(areTrainingPolishSubBlocksClosed()).toBe(true)
  })
})