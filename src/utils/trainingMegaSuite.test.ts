import { describe, expect, it } from 'vitest'
import {
  countTrainingMegaBlocks,
  countTrainingMegaOleadas,
  TRAINING_MEGA_BLOCKS,
  trainingFullMegaRange,
  trainingMegaBlockById,
} from './trainingMegaSuite'

describe('trainingMegaSuite', () => {
  it('mega-inventario 4 bloques oleadas 361–409', () => {
    expect(countTrainingMegaBlocks()).toBe(4)
    expect(trainingFullMegaRange()).toEqual({ from: 361, to: 409 })
    expect(countTrainingMegaOleadas()).toBe(49)
    expect(TRAINING_MEGA_BLOCKS.map((b) => b.id)).toEqual([
      'polish-v1',
      'e2e',
      'polish-v2',
      'entrena-plan',
    ])
  })

  it('trainingMegaBlockById', () => {
    const e2e = trainingMegaBlockById('e2e')
    expect(e2e?.closedOleada).toBe(409)
    expect(e2e?.range).toEqual({ from: 378, to: 409 })
    const plan = trainingMegaBlockById('entrena-plan')
    expect(plan?.range).toEqual({ from: 401, to: 409 })
    expect(plan?.closedOleada).toBe(409)
    const polishV2 = trainingMegaBlockById('polish-v2')
    expect(polishV2?.closedOleada).toBe(409)
    expect(polishV2?.range).toEqual({ from: 383, to: 409 })
  })
})