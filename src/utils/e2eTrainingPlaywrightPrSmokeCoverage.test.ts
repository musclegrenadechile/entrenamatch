import { describe, expect, it } from 'vitest'
import {
  countE2ETrainingPlaywrightPrSmokeSpecs,
  e2eTrainingPlaywrightPrSmokeBlockRange,
  E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_SPECS,
  isTrainingPlaywrightPrSmokeCoverageComplete,
  trainingPlaywrightPrSmokeSpecFileBasenames,
  unionTrainingPlaywrightPrSmokeCovers,
} from './e2eTrainingPlaywrightPrSmokeCoverage'

describe('e2eTrainingPlaywrightPrSmokeCoverage', () => {
  it('smoke Playwright PR 3 specs oleadas 440–453', () => {
    expect(countE2ETrainingPlaywrightPrSmokeSpecs()).toBe(3)
    expect(E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_SPECS.map((s) => s.id)).toEqual([
      'training-mega-flow',
      'workout-history-flow',
      'workout-history-flow',
    ])
    expect(unionTrainingPlaywrightPrSmokeCovers().sort()).toEqual(
      [
        'aria',
        'harness',
        'history-row-pr-tone',
        'mega-flow-review-pr',
        'sparkline-pr-tone',
      ].sort()
    )
    expect(trainingPlaywrightPrSmokeSpecFileBasenames()).toEqual([
      'training-mega-flow.spec.ts',
      'workout-history-flow.spec.ts',
    ])
  })

  it('bloque 440–453 y cobertura completa', () => {
    expect(e2eTrainingPlaywrightPrSmokeBlockRange()).toEqual({ from: 440, to: 453 })
    expect(isTrainingPlaywrightPrSmokeCoverageComplete()).toBe(true)
  })
})