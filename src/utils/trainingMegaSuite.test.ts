import { describe, expect, it } from 'vitest'
import {
  areAllTrainingMegaSubBlocksClosed,
  countTrainingMegaBlocks,
  countTrainingMegaOleadas,
  isTrainingMegaBlockClosed,
  TRAINING_MEGA_BLOCKS,
  trainingFullMegaRange,
  trainingMegaBlockById,
} from './trainingMegaSuite'

describe('trainingMegaSuite', () => {
  it('mega-inventario 5 bloques oleadas 361–411', () => {
    expect(countTrainingMegaBlocks()).toBe(5)
    expect(trainingFullMegaRange()).toEqual({ from: 361, to: 411 })
    expect(countTrainingMegaOleadas()).toBe(51)
    expect(TRAINING_MEGA_BLOCKS.map((b) => b.id)).toEqual([
      'polish-v1',
      'e2e',
      'polish-v2',
      'entrena-plan',
      'fuel-plan',
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
    const fuelPlan = trainingMegaBlockById('fuel-plan')
    expect(fuelPlan?.range).toEqual({ from: 411, to: 414 })
    expect(fuelPlan?.closedOleada).toBe(414)
    expect(fuelPlan?.suiteModule).toBe('fuelPlanTrainingSuite')
  })

  it('cierre mega entrenamiento 361–410 (oleada 411)', () => {
    expect(isTrainingMegaBlockClosed()).toBe(true)
    expect(isTrainingMegaBlockClosed(410)).toBe(false)
    expect(areAllTrainingMegaSubBlocksClosed(411)).toBe(false)
  })

  it('cierre fuel-plan en mega (oleada 414)', () => {
    expect(areAllTrainingMegaSubBlocksClosed(414)).toBe(true)
  })
})