import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPostMegaUtils,
  isTrainingPolishPostMegaClosed,
  trainingPolishPostMegaRange,
  TRAINING_POLISH_POST_MEGA_UTILS,
} from './trainingPolishPostMegaSuite'

describe('trainingPolishPostMegaSuite', () => {
  it('inventario post-mega 415–419 cerrado', () => {
    expect(countTrainingPolishPostMegaUtils()).toBe(7)
    expect(trainingPolishPostMegaRange()).toEqual({ from: 415, to: 419 })
    expect(isTrainingPolishPostMegaClosed()).toBe(true)
    expect(TRAINING_POLISH_POST_MEGA_UTILS.map((e) => e.module)).toContain(
      'weeklyPlanNutritionDisplay'
    )
    expect(TRAINING_POLISH_POST_MEGA_UTILS.map((e) => e.module)).toContain(
      'e2eWeeklyPlanHistoryFlow'
    )
    expect(TRAINING_POLISH_POST_MEGA_UTILS.map((e) => e.module)).toContain('e2eTrainingMegaFlow')
    expect(TRAINING_POLISH_POST_MEGA_UTILS.map((e) => e.module)).toContain(
      'weeklyPlanHeadlineFuelDisplay'
    )
    expect(TRAINING_POLISH_POST_MEGA_UTILS.map((e) => e.module)).toContain(
      'e2eFuelPlanNutritionCoverage'
    )
    expect(TRAINING_POLISH_POST_MEGA_UTILS.map((e) => e.module)).toContain(
      'e2eFuelPlanHeadlineCoverage'
    )
  })
})