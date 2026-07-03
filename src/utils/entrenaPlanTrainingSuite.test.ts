import { describe, expect, it } from 'vitest'
import {
  countEntrenaPlanTrainingOleadas,
  countEntrenaPlanTrainingUtils,
  entrenaPlanTrainingBlockRange,
  ENTRENA_PLAN_TRAINING_UTILS,
  isEntrenaPlanTrainingBlockClosed,
} from './entrenaPlanTrainingSuite'

describe('entrenaPlanTrainingSuite', () => {
  it('inventario EntrenaPlan × historial oleadas 401–409', () => {
    expect(countEntrenaPlanTrainingUtils()).toBe(12)
    expect(entrenaPlanTrainingBlockRange()).toEqual({ from: 401, to: 409 })
    expect(countEntrenaPlanTrainingOleadas()).toBe(9)
    expect(ENTRENA_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain(
      'weeklyPlanHistoryDisplay'
    )
    expect(ENTRENA_PLAN_TRAINING_UTILS.map((e) => e.module)).toContain(
      'e2ePlanRotationCoverage'
    )
  })

  it('cierre bloque EntrenaPlan×historial (oleada 409)', () => {
    expect(isEntrenaPlanTrainingBlockClosed()).toBe(true)
    expect(isEntrenaPlanTrainingBlockClosed(408)).toBe(false)
  })
})