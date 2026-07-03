import { describe, expect, it } from 'vitest'
import {
  countTrainingMegaBlocks,
  countTrainingMegaOleadas,
  TRAINING_MEGA_BLOCKS,
  trainingFullMegaRange,
  trainingMegaBlockById,
} from './trainingMegaSuite'

describe('trainingMegaSuite', () => {
  it('mega-inventario 4 bloques oleadas 361–405', () => {
    expect(countTrainingMegaBlocks()).toBe(4)
    expect(trainingFullMegaRange()).toEqual({ from: 361, to: 405 })
    expect(countTrainingMegaOleadas()).toBe(45)
    expect(TRAINING_MEGA_BLOCKS.map((b) => b.id)).toEqual([
      'polish-v1',
      'e2e',
      'polish-v2',
      'entrena-plan',
    ])
  })

  it('trainingMegaBlockById', () => {
    const e2e = trainingMegaBlockById('e2e')
    expect(e2e?.closedOleada).toBe(405)
    expect(e2e?.range).toEqual({ from: 378, to: 405 })
    const plan = trainingMegaBlockById('entrena-plan')
    expect(plan?.range).toEqual({ from: 401, to: 405 })
  })
})