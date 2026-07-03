import { describe, expect, it } from 'vitest'
import {
  countGymLogTrainingUtils,
  GYM_LOG_TRAINING_UTILS,
  gymLogTrainingBlockRange,
} from './gymLogTrainingSuite'

describe('gymLogTrainingSuite', () => {
  it('inventario 4 utils oleadas 383–386', () => {
    expect(countGymLogTrainingUtils()).toBe(4)
    expect(GYM_LOG_TRAINING_UTILS.map((u) => u.oleada)).toEqual([383, 384, 385, 386])
    expect(gymLogTrainingBlockRange()).toEqual({ from: 383, to: 386 })
  })

  it('cubre progress, pr, feedback e hint', () => {
    const all = GYM_LOG_TRAINING_UTILS.flatMap((u) => u.covers)
    expect(all).toContain('progress')
    expect(all).toContain('pr')
    expect(all).toContain('feedback')
    expect(all).toContain('hint')
  })
})