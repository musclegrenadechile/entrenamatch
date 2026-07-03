import { describe, expect, it } from 'vitest'
import {
  countE2ETrainingPostPrMegaSpecs,
  E2E_TRAINING_POST_PR_MEGA_SPECS,
  e2eTrainingPostPrMegaBlockRange,
  isTrainingPostPrMegaCoverageComplete,
  trainingPostPrMegaSpecFileBasenames,
  unionTrainingPostPrMegaCovers,
} from './e2eTrainingPostPrMegaCoverage'

describe('e2eTrainingPostPrMegaCoverage', () => {
  it('union mega post-PR 9 specs oleadas 436–452', () => {
    expect(countE2ETrainingPostPrMegaSpecs()).toBe(9)
    expect(E2E_TRAINING_POST_PR_MEGA_SPECS.map((s) => s.id)).toEqual([
      'workout-flow',
      'workout-fab-flow',
      'workout-flow',
      'workout-fuel-flow',
      'workout-history-flow',
      'workout-flow',
      'workout-history-flow',
      'training-full-flow',
      'training-mega-flow',
    ])
    expect(unionTrainingPostPrMegaCovers().sort()).toEqual(
      [
        'aria',
        'banner-pr-tone',
        'fab-session-pr-tone',
        'full-flow-review-pr',
        'fuel-prefill-pr-tone',
        'harness',
        'history-row-pr-tone',
        'mega-flow-review-pr',
        'review-pr-tone',
        'session-pr-tone',
        'sparkline-pr-tone',
      ].sort()
    )
    expect(trainingPostPrMegaSpecFileBasenames()).toEqual([
      'workout-flow.spec.ts',
      'workout-fab-flow.spec.ts',
      'workout-flow.spec.ts',
      'workout-fuel-flow.spec.ts',
      'workout-history-flow.spec.ts',
      'workout-flow.spec.ts',
      'workout-history-flow.spec.ts',
      'training-full-flow.spec.ts',
      'training-mega-flow.spec.ts',
    ])
  })

  it('bloque 436–452 y cobertura completa', () => {
    expect(e2eTrainingPostPrMegaBlockRange()).toEqual({ from: 436, to: 452 })
    expect(isTrainingPostPrMegaCoverageComplete()).toBe(true)
  })
})