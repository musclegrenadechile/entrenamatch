import { describe, expect, it } from 'vitest'
import {
  countEntrenaPlanTrainingUtils,
  entrenaPlanTrainingBlockRange,
  ENTRENA_PLAN_TRAINING_UTILS,
} from './entrenaPlanTrainingSuite'

describe('entrenaPlanTrainingSuite', () => {
  it('inventario EntrenaPlan × historial oleada 401', () => {
    expect(countEntrenaPlanTrainingUtils()).toBe(4)
    expect(entrenaPlanTrainingBlockRange()).toEqual({ from: 401, to: 404 })
    expect(ENTRENA_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain(
      'weeklyPlanHistoryDisplay'
    )
  })
})