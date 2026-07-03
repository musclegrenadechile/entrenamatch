import { describe, expect, it } from 'vitest'
import {
  countTrainingPlaywrightPrSmokeRunSpecs,
  e2eTrainingPlaywrightPrSmokeRunBlockRange,
  isTrainingPlaywrightPrSmokeRunReady,
  trainingPlaywrightPrSmokeRunCommand,
  trainingPlaywrightPrSmokeRunSpecFileBasenames,
} from './e2eTrainingPlaywrightPrSmokeRun'

describe('e2eTrainingPlaywrightPrSmokeRun', () => {
  it('registro run local PR smoke oleada 454', () => {
    expect(countTrainingPlaywrightPrSmokeRunSpecs()).toBe(2)
    expect(trainingPlaywrightPrSmokeRunSpecFileBasenames()).toEqual([
      'training-mega-flow.spec.ts',
      'workout-history-flow.spec.ts',
    ])
    expect(trainingPlaywrightPrSmokeRunCommand()).toContain('training-mega-flow.spec.ts')
    expect(trainingPlaywrightPrSmokeRunCommand()).toContain('workout-history-flow.spec.ts')
    expect(trainingPlaywrightPrSmokeRunCommand()).toContain('127.0.0.1:4173')
  })

  it('bloque 453–454 y run listo', () => {
    expect(e2eTrainingPlaywrightPrSmokeRunBlockRange()).toEqual({ from: 453, to: 454 })
    expect(isTrainingPlaywrightPrSmokeRunReady()).toBe(true)
  })
})