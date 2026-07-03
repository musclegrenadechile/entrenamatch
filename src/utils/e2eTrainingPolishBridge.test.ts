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
    expect(countE2ETrainingPolishBridgeEntries()).toBe(12)
    expect(E2E_TRAINING_POLISH_BRIDGE.map((e) => e.polishOleada)).toContain(391)
    expect(E2E_TRAINING_POLISH_BRIDGE.map((e) => e.polishOleada)).toContain(397)
  })

  it('trainingMegaBlockRange 378–402', () => {
    expect(trainingMegaBlockRange()).toEqual({ from: 378, to: 402 })
  })

  it('uniqueE2EValidatedPolishOleadas y e2eBridgeEntriesForOleada', () => {
    expect(uniqueE2EValidatedPolishOleadas()).toEqual([
      384, 386, 388, 391, 392, 393, 394, 395, 396, 397, 401,
    ])
    expect(e2eBridgeEntriesForOleada(393).map((e) => e.e2eSpecId)).toEqual([
      'workout-fuel-flow',
      'training-mega-flow',
    ])
  })
})