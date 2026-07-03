import { describe, expect, it } from 'vitest'
import {
  areAllTrainingPrV2SubBlocksClosed,
  countTrainingPrV2Blocks,
  countTrainingPrV2Oleadas,
  isTrainingPrV2FullyClosed,
  isTrainingPrV2GlobalClosed,
  TRAINING_PR_V2_BLOCKS,
  trainingPrV2BlockById,
  trainingPrV2FullRange,
} from './trainingPrV2Suite'

describe('trainingPrV2Suite', () => {
  it('inventario PR v2 oleadas 436–444', () => {
    expect(countTrainingPrV2Blocks()).toBe(4)
    expect(countTrainingPrV2Oleadas()).toBe(8)
    expect(trainingPrV2FullRange()).toEqual({ from: 436, to: 444 })
    expect(TRAINING_PR_V2_BLOCKS.map((b) => b.id)).toEqual([
      'gym-log-v2',
      'post-workout-v2',
      'history-v2',
      'pr-v2-global',
    ])
    expect(trainingPrV2BlockById('gym-log-v2')?.closedOleada).toBe(438)
    expect(trainingPrV2BlockById('post-workout-v2')?.closedOleada).toBe(442)
    expect(trainingPrV2BlockById('history-v2')?.closedOleada).toBe(443)
    expect(trainingPrV2BlockById('pr-v2-global')?.closedOleada).toBe(444)
    expect(isTrainingPrV2GlobalClosed()).toBe(true)
    expect(isTrainingPrV2GlobalClosed(443)).toBe(false)
    expect(areAllTrainingPrV2SubBlocksClosed(443)).toBe(false)
    expect(isTrainingPrV2FullyClosed(443)).toBe(false)
  })
})