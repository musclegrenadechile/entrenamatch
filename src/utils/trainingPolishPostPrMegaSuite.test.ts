import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPostPrMegaUtils,
  isTrainingPolishPostPrMegaClosed,
  TRAINING_POLISH_POST_PR_MEGA_UTILS,
  trainingPolishPostPrMegaRange,
} from './trainingPolishPostPrMegaSuite'

describe('trainingPolishPostPrMegaSuite', () => {
  it('union mega post-PR oleadas 451–452', () => {
    expect(countTrainingPolishPostPrMegaUtils()).toBe(2)
    expect(TRAINING_POLISH_POST_PR_MEGA_UTILS[0].module).toBe('e2eTrainingPostPrMegaCoverage')
    expect(TRAINING_POLISH_POST_PR_MEGA_UTILS[1].module).toBe('e2eTrainingPostPrMegaPostV2Coverage')
    expect(TRAINING_POLISH_POST_PR_MEGA_UTILS[0].covers).toContain('review')
    expect(TRAINING_POLISH_POST_PR_MEGA_UTILS[0].covers).toContain('sparkline')
    expect(trainingPolishPostPrMegaRange()).toEqual({ from: 451, to: 452 })
    expect(isTrainingPolishPostPrMegaClosed()).toBe(true)
    expect(isTrainingPolishPostPrMegaClosed(451)).toBe(false)
  })
})