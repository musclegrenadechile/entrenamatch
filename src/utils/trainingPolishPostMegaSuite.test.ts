import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPostMegaUtils,
  isTrainingPolishPostMegaClosed,
  trainingPolishPostMegaRange,
  TRAINING_POLISH_POST_MEGA_UTILS,
} from './trainingPolishPostMegaSuite'

describe('trainingPolishPostMegaSuite', () => {
  it('inventario post-mega 415–417 cerrado', () => {
    expect(countTrainingPolishPostMegaUtils()).toBe(4)
    expect(trainingPolishPostMegaRange()).toEqual({ from: 415, to: 417 })
    expect(isTrainingPolishPostMegaClosed()).toBe(true)
    expect(TRAINING_POLISH_POST_MEGA_UTILS.map((e) => e.module)).toContain(
      'weeklyPlanNutritionDisplay'
    )
    expect(TRAINING_POLISH_POST_MEGA_UTILS.map((e) => e.module)).toContain(
      'e2eWeeklyPlanHistoryFlow'
    )
    expect(TRAINING_POLISH_POST_MEGA_UTILS.map((e) => e.module)).toContain('e2eTrainingMegaFlow')
  })
})