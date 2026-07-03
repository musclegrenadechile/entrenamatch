import { describe, expect, it } from 'vitest'
import {
  countTrainingPrV2TrainingUtils,
  TRAINING_PR_V2_TRAINING_UTILS,
  trainingPrV2TrainingBlockRange,
} from './trainingPrV2TrainingSuite'

describe('trainingPrV2TrainingSuite', () => {
  it('inventario PR v2 global oleadas 436–451', () => {
    expect(countTrainingPrV2TrainingUtils()).toBe(10)
    expect(trainingPrV2TrainingBlockRange()).toEqual({ from: 436, to: 451 })
    expect(TRAINING_PR_V2_TRAINING_UTILS.map((u) => u.oleada)).toEqual([
      444, 444, 444, 444, 444, 447, 447, 451, 451, 451,
    ])
    expect(TRAINING_PR_V2_TRAINING_UTILS.map((u) => u.module)).toContain('trainingPrV2Suite')
    expect(TRAINING_PR_V2_TRAINING_UTILS.map((u) => u.module)).toContain(
      'trainingPrV2GlobalClosure'
    )
    expect(TRAINING_PR_V2_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eTrainingPrV2GlobalCoverage'
    )
    expect(TRAINING_PR_V2_TRAINING_UTILS.map((u) => u.module)).toContain(
      'trainingPolishPrV2GlobalSuite'
    )
    expect(TRAINING_PR_V2_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eTrainingPrV2FullCoverage'
    )
    expect(TRAINING_PR_V2_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eTrainingPrV2Coverage'
    )
    expect(TRAINING_PR_V2_TRAINING_UTILS.map((u) => u.module)).toContain(
      'trainingPolishPrV2UnionSuite'
    )
    expect(TRAINING_PR_V2_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eTrainingPostPrMegaCoverage'
    )
    expect(TRAINING_PR_V2_TRAINING_UTILS.map((u) => u.module)).toContain(
      'trainingPolishPostPrMegaSuite'
    )
    expect(TRAINING_PR_V2_TRAINING_UTILS.map((u) => u.module)).toContain(
      'e2eTrainingPostPrMegaFullCoverage'
    )
  })
})