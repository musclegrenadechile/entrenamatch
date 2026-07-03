import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishBlocks,
  countTrainingPolishOleadas,
  TRAINING_POLISH_BLOCKS,
  trainingPolishBlockById,
  trainingPolishMegaRange,
} from './trainingPolishSuite'

describe('trainingPolishSuite', () => {
  it('mega-inventario 5 bloques oleadas 383–408', () => {
    expect(countTrainingPolishBlocks()).toBe(5)
    expect(trainingPolishMegaRange()).toEqual({ from: 383, to: 408 })
    expect(countTrainingPolishOleadas()).toBe(26)
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
    expect(plan?.range).toEqual({ from: 401, to: 408 })
  })
})