import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishGymLogV2Utils,
  isTrainingPolishGymLogV2Open,
  TRAINING_POLISH_GYM_LOG_V2_UTILS,
  trainingPolishGymLogV2Range,
} from './trainingPolishGymLogV2Suite'

describe('trainingPolishGymLogV2Suite', () => {
  it('pivot gym-log v2 oleadas 436–437', () => {
    expect(countTrainingPolishGymLogV2Utils()).toBe(2)
    expect(trainingPolishGymLogV2Range()).toEqual({ from: 436, to: 437 })
    expect(TRAINING_POLISH_GYM_LOG_V2_UTILS.map((e) => e.id)).toEqual([
      'session-pr-tone',
      'fab-session-pr-tone',
    ])
    expect(isTrainingPolishGymLogV2Open()).toBe(true)
    expect(isTrainingPolishGymLogV2Open(435)).toBe(false)
  })
})