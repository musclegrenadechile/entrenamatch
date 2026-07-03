import { describe, expect, it } from 'vitest'
import {
  areAllTrainingMegaSubBlocksClosed,
  countTrainingMegaBlocks,
  countTrainingMegaOleadas,
  isTrainingMegaBlockClosed,
  isTrainingMegaFullyClosed,
  isTrainingMegaPhase1Closed,
  isTrainingMegaPhase3Closed,
  isTrainingMegaPhase4Closed,
  isTrainingMegaPhase5Closed,
  isTrainingMegaPhase6Closed,
  TRAINING_MEGA_BLOCKS,
  trainingFullMegaRange,
  trainingMegaBlockById,
} from './trainingMegaSuite'

describe('trainingMegaSuite', () => {
  it('mega-inventario 10 bloques oleadas 361–434', () => {
    expect(countTrainingMegaBlocks()).toBe(10)
    expect(trainingFullMegaRange()).toEqual({ from: 361, to: 434 })
    expect(countTrainingMegaOleadas()).toBe(74)
    expect(TRAINING_MEGA_BLOCKS.map((b) => b.id)).toEqual([
      'polish-v1',
      'e2e',
      'polish-v2',
      'entrena-plan',
      'fuel-plan',
      'polish-post-mega',
      'polish-post-full',
      'polish-post-stack',
      'polish-post-fuel',
      'polish-post-energy',
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
    expect(fuelPlan?.range).toEqual({ from: 411, to: 434 })
    const postFull = trainingMegaBlockById('polish-post-full')
    expect(postFull?.range).toEqual({ from: 421, to: 427 })
    expect(postFull?.closedOleada).toBe(427)
    const postStack = trainingMegaBlockById('polish-post-stack')
    expect(postStack?.range).toEqual({ from: 428, to: 429 })
    expect(postStack?.closedOleada).toBe(429)
    const postMega = trainingMegaBlockById('polish-post-mega')
    expect(postMega?.range).toEqual({ from: 415, to: 420 })
    expect(postMega?.closedOleada).toBe(420)
    expect(fuelPlan?.closedOleada).toBe(414)
    expect(fuelPlan?.suiteModule).toBe('fuelPlanTrainingSuite')
  })

  it('cierre mega fase I 361–410 (oleada 411)', () => {
    expect(isTrainingMegaPhase1Closed()).toBe(true)
    expect(isTrainingMegaPhase1Closed(410)).toBe(false)
    expect(isTrainingMegaBlockClosed(411)).toBe(false)
    expect(areAllTrainingMegaSubBlocksClosed(411)).toBe(false)
  })

  it('cierre mega II 361–414 (oleada 415)', () => {
    expect(isTrainingMegaBlockClosed(414)).toBe(true)
    expect(isTrainingMegaBlockClosed(413)).toBe(false)
    expect(areAllTrainingMegaSubBlocksClosed(414)).toBe(false)
    expect(isTrainingMegaFullyClosed(414)).toBe(false)
  })

  it('cierre post-mega 415–420 (oleada 420)', () => {
    expect(isTrainingMegaPhase3Closed()).toBe(true)
    expect(isTrainingMegaPhase3Closed(419)).toBe(false)
    expect(areAllTrainingMegaSubBlocksClosed(420)).toBe(false)
  })

  it('cierre post-full 421–427 (oleada 427)', () => {
    expect(areAllTrainingMegaSubBlocksClosed(427)).toBe(false)
    expect(isTrainingMegaPhase4Closed(427)).toBe(false)
  })

  it('mega fase V post-stack 428–429 (oleada 429)', () => {
    expect(isTrainingMegaPhase4Closed()).toBe(true)
    expect(isTrainingMegaPhase4Closed(428)).toBe(false)
    expect(areAllTrainingMegaSubBlocksClosed(429)).toBe(false)
  })

  it('mega fase VI post-fuel 430–432 (oleada 432)', () => {
    expect(isTrainingMegaPhase5Closed()).toBe(true)
    expect(isTrainingMegaPhase5Closed(431)).toBe(false)
    const postFuel = trainingMegaBlockById('polish-post-fuel')
    expect(postFuel?.range).toEqual({ from: 430, to: 432 })
    expect(postFuel?.closedOleada).toBe(432)
    expect(areAllTrainingMegaSubBlocksClosed(432)).toBe(false)
    expect(isTrainingMegaFullyClosed(432)).toBe(false)
  })

  it('mega fase VII post-energy 433–434 (oleada 434)', () => {
    expect(isTrainingMegaPhase6Closed()).toBe(true)
    expect(isTrainingMegaPhase6Closed(433)).toBe(false)
    const postEnergy = trainingMegaBlockById('polish-post-energy')
    expect(postEnergy?.range).toEqual({ from: 433, to: 434 })
    expect(postEnergy?.closedOleada).toBe(434)
    expect(areAllTrainingMegaSubBlocksClosed(434)).toBe(true)
    expect(isTrainingMegaFullyClosed(434)).toBe(true)
  })
})