import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishBlocks,
  countTrainingPolishOleadas,
  TRAINING_POLISH_BLOCKS,
  trainingPolishBlockById,
  trainingPolishMegaRange,
} from './trainingPolishSuite'

describe('trainingPolishSuite', () => {
  it('mega-inventario 4 bloques oleadas 383–397', () => {
    expect(countTrainingPolishBlocks()).toBe(4)
    expect(trainingPolishMegaRange()).toEqual({ from: 383, to: 397 })
    expect(countTrainingPolishOleadas()).toBe(15)
    expect(TRAINING_POLISH_BLOCKS.map((b) => b.id)).toEqual([
      'gym-log-live',
      'fab-session',
      'post-workout',
      'history',
    ])
  })

  it('trainingPolishBlockById', () => {
    const history = trainingPolishBlockById('history')
    expect(history?.closedOleada).toBe(397)
    expect(history?.suiteModule).toBe('workoutHistoryTrainingSuite')
    const fab = trainingPolishBlockById('fab-session')
    expect(fab?.range).toEqual({ from: 387, to: 389 })
  })
})