import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPostMegaUtils,
  isTrainingPolishPostMegaClosed,
  trainingPolishPostMegaRange,
  TRAINING_POLISH_POST_MEGA_UTILS,
} from './trainingPolishPostMegaSuite'

describe('trainingPolishPostMegaSuite', () => {
  it('inventario post-mega 415–416 cerrado', () => {
    expect(countTrainingPolishPostMegaUtils()).toBe(3)
    expect(trainingPolishPostMegaRange()).toEqual({ from: 415, to: 416 })
    expect(isTrainingPolishPostMegaClosed()).toBe(true)
    expect(TRAINING_POLISH_POST_MEGA_UTILS.map((e) => e.module)).toContain(
      'weeklyPlanNutritionDisplay'
    )
    expect(TRAINING_POLISH_POST_MEGA_UTILS.map((e) => e.module)).toContain(
      'e2eWeeklyPlanHistoryFlow'
    )
  })
})