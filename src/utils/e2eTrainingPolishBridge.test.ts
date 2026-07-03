import { describe, expect, it } from 'vitest'
import {
  countE2ETrainingPolishBridgeEntries,
  E2E_TRAINING_POLISH_BRIDGE,
  e2eBridgeEntriesForOleada,
  trainingMegaBlockRange,
  uniqueE2EValidatedPolishOleadas,
} from './e2eTrainingPolishBridge'

describe('e2eTrainingPolishBridge', () => {
  it('define puente E2E ↔ pulido', () => {
    expect(countE2ETrainingPolishBridgeEntries()).toBe(57)
    expect(E2E_TRAINING_POLISH_BRIDGE.map((e) => e.polishOleada)).toContain(391)
    expect(E2E_TRAINING_POLISH_BRIDGE.map((e) => e.polishOleada)).toContain(397)
  })

  it('trainingMegaBlockRange 361–428', () => {
    expect(trainingMegaBlockRange()).toEqual({ from: 361, to: 428 })
  })

  it('uniqueE2EValidatedPolishOleadas y e2eBridgeEntriesForOleada', () => {
    expect(uniqueE2EValidatedPolishOleadas()).toEqual([
      384, 386, 388, 391, 392, 393, 394, 395, 396, 397, 401, 404, 405, 406, 407, 408, 409, 410,
      411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427,
      428,
    ])
    expect(e2eBridgeEntriesForOleada(393).map((e) => e.e2eSpecId)).toEqual([
      'workout-fuel-flow',
      'training-mega-flow',
    ])
  })
})