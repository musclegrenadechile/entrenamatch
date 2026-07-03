import { describe, expect, it } from 'vitest'
import {
  countTrainingMegaBlocks,
  countTrainingMegaOleadas,
  TRAINING_MEGA_BLOCKS,
  trainingFullMegaRange,
  trainingMegaBlockById,
} from './trainingMegaSuite'

describe('trainingMegaSuite', () => {
  it('mega-inventario 4 bloques oleadas 361–410', () => {
    expect(countTrainingMegaBlocks()).toBe(4)
    expect(trainingFullMegaRange()).toEqual({ from: 361, to: 410 })
    expect(countTrainingMegaOleadas()).toBe(50)
    expect(TRAINING_MEGA_BLOCKS.map((b) => b.id)).toEqual([
      'polish-v1',
      'e2e',
      'polish-v2',
      'entrena-plan',
    ])
  })

  it('trainingMegaBlockById', () => {
    const e2e = trainingMegaBlockById('e2e')
    expect(e2e?.closedOleada).toBe(410)
    expect(e2e?.range).toEqual({ from: 378, to: 410 })
    const plan = trainingMegaBlockById('entrena-plan')
    expect(plan?.range).toEqual({ from: 401, to: 409 })
    expect(plan?.closedOleada).toBe(409)
    const polishV2 = trainingMegaBlockById('polish-v2')
    expect(polishV2?.closedOleada).toBe(410)
    expect(polishV2?.range).toEqual({ from: 383, to: 409 })
  })
})