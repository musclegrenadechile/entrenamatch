import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishPrV2UnionUtils,
  TRAINING_POLISH_PR_V2_UNION_OLEADA,
  TRAINING_POLISH_PR_V2_UNION_UTILS,
  trainingPolishPrV2UnionRange,
} from './trainingPolishPrV2UnionSuite'

describe('trainingPolishPrV2UnionSuite', () => {
  it('inventario union meta PR v2 oleada 447', () => {
    expect(countTrainingPolishPrV2UnionUtils()).toBe(1)
    expect(TRAINING_POLISH_PR_V2_UNION_UTILS[0].module).toBe('e2eTrainingPrV2Coverage')
    expect(TRAINING_POLISH_PR_V2_UNION_UTILS[0].oleada).toBe(447)
  })

  it('rango oleada 447', () => {
    expect(trainingPolishPrV2UnionRange()).toEqual({ from: 447, to: 447 })
    expect(TRAINING_POLISH_PR_V2_UNION_OLEADA).toBe(447)
  })
})