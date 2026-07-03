import { describe, expect, it } from 'vitest'
import {
  countE2ETrainingPrV2Specs,
  E2E_TRAINING_PR_V2_SPECS,
  e2eTrainingPrV2UnionBlockRange,
  isTrainingPrV2CoverageComplete,
  trainingPrV2SpecFileBasenames,
  unionTrainingPrV2Covers,
} from './e2eTrainingPrV2Coverage'

describe('e2eTrainingPrV2Coverage', () => {
  it('union PR v2 specs oleadas 436–444', () => {
    expect(countE2ETrainingPrV2Specs()).toBe(5)
    expect(E2E_TRAINING_PR_V2_SPECS.map((s) => s.id)).toEqual([
      'workout-flow',
      'workout-fab-flow',
      'workout-flow',
      'workout-fuel-flow',
      'workout-history-flow',
    ])
    expect(unionTrainingPrV2Covers().sort()).toEqual(
      [
        'aria',
        'banner-pr-tone',
        'fab-session-pr-tone',
        'fuel-prefill-pr-tone',
        'harness',
        'history-row-pr-tone',
        'session-pr-tone',
      ].sort()
    )
    expect(trainingPrV2SpecFileBasenames()).toEqual([
      'workout-flow.spec.ts',
      'workout-fab-flow.spec.ts',
      'workout-flow.spec.ts',
      'workout-fuel-flow.spec.ts',
      'workout-history-flow.spec.ts',
    ])
  })

  it('bloque 436–444 y cobertura completa', () => {
    expect(e2eTrainingPrV2UnionBlockRange()).toEqual({ from: 436, to: 444 })
    expect(isTrainingPrV2CoverageComplete()).toBe(true)
  })
})