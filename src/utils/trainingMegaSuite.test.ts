import { describe, expect, it } from 'vitest'
import {
  countTrainingMegaBlocks,
  countTrainingMegaOleadas,
  TRAINING_MEGA_BLOCKS,
  trainingFullMegaRange,
  trainingMegaBlockById,
} from './trainingMegaSuite'

describe('trainingMegaSuite', () => {
  it('mega-inventario 4 bloques oleadas 361–408', () => {
    expect(countTrainingMegaBlocks()).toBe(4)
    expect(trainingFullMegaRange()).toEqual({ from: 361, to: 408 })
    expect(countTrainingMegaOleadas()).toBe(48)
    expect(TRAINING_MEGA_BLOCKS.map((b) => b.id)).toEqual([
      'polish-v1',
      'e2e',
      'polish-v2',
      'entrena-plan',
    ])
  })

  it('trainingMegaBlockById', () => {
    const e2e = trainingMegaBlockById('e2e')
    expect(e2e?.closedOleada).toBe(408)
    expect(e2e?.range).toEqual({ from: 378, to: 408 })
    const plan = trainingMegaBlockById('entrena-plan')
    expect(plan?.range).toEqual({ from: 401, to: 408 })
    const polishV2 = trainingMegaBlockById('polish-v2')
    expect(polishV2?.closedOleada).toBe(408)
    expect(polishV2?.range).toEqual({ from: 383, to: 408 })
  })
})