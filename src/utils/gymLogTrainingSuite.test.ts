import { describe, expect, it } from 'vitest'
import {
  countGymLogTrainingUtils,
  GYM_LOG_TRAINING_UTILS,
  gymLogTrainingBlockRange,
} from './gymLogTrainingSuite'

describe('gymLogTrainingSuite', () => {
  it('inventario gym-log oleadas 383–438', () => {
    expect(countGymLogTrainingUtils()).toBe(12)
    expect(GYM_LOG_TRAINING_UTILS.map((u) => u.oleada)).toEqual([
      383, 384, 385, 386, 436, 436, 436, 437, 437, 438, 438, 438,
    ])
    expect(gymLogTrainingBlockRange()).toEqual({ from: 383, to: 438 })
    expect(GYM_LOG_TRAINING_UTILS.map((u) => u.module)).toContain('gymLogSessionPrToneDisplay')
    expect(GYM_LOG_TRAINING_UTILS.map((u) => u.module)).toContain('e2eGymLogSessionPrCoverage')
    expect(GYM_LOG_TRAINING_UTILS.map((u) => u.module)).toContain('trainingPolishGymLogV2Suite')
    expect(GYM_LOG_TRAINING_UTILS.map((u) => u.module)).toContain('gymLogFabSessionPrToneDisplay')
    expect(GYM_LOG_TRAINING_UTILS.map((u) => u.module)).toContain('e2eGymLogFabSessionPrCoverage')
    expect(GYM_LOG_TRAINING_UTILS.map((u) => u.module)).toContain('e2eGymLogCoverage')
    expect(GYM_LOG_TRAINING_UTILS.map((u) => u.module)).toContain('e2eGymLogPostV2Coverage')
    expect(GYM_LOG_TRAINING_UTILS.map((u) => u.module)).toContain('e2eGymLogFullCoverage')
  })

  it('cubre progress, pr, feedback e hint', () => {
    const all = GYM_LOG_TRAINING_UTILS.flatMap((u) => u.covers)
    expect(all).toContain('progress')
    expect(all).toContain('pr')
    expect(all).toContain('feedback')
    expect(all).toContain('hint')
  })
})