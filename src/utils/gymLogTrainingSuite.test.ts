import { describe, expect, it } from 'vitest'
import {
  countGymLogTrainingUtils,
  GYM_LOG_TRAINING_UTILS,
  gymLogTrainingBlockRange,
} from './gymLogTrainingSuite'

describe('gymLogTrainingSuite', () => {
  it('inventario gym-log oleadas 383–436', () => {
    expect(countGymLogTrainingUtils()).toBe(7)
    expect(GYM_LOG_TRAINING_UTILS.map((u) => u.oleada)).toEqual([
      383, 384, 385, 386, 436, 436, 436,
    ])
    expect(gymLogTrainingBlockRange()).toEqual({ from: 383, to: 436 })
    expect(GYM_LOG_TRAINING_UTILS.map((u) => u.module)).toContain('gymLogSessionPrToneDisplay')
    expect(GYM_LOG_TRAINING_UTILS.map((u) => u.module)).toContain('e2eGymLogSessionPrCoverage')
    expect(GYM_LOG_TRAINING_UTILS.map((u) => u.module)).toContain('trainingPolishGymLogV2Suite')
  })

  it('cubre progress, pr, feedback e hint', () => {
    const all = GYM_LOG_TRAINING_UTILS.flatMap((u) => u.covers)
    expect(all).toContain('progress')
    expect(all).toContain('pr')
    expect(all).toContain('feedback')
    expect(all).toContain('hint')
  })
})