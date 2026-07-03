import { describe, expect, it } from 'vitest'
import {
  countTrainingE2ESpecs,
  E2E_TRAINING_PLAYWRIGHT_SPECS,
  trainingMegaSpecEntry,
} from './e2eTrainingSuite'

describe('e2eTrainingSuite', () => {
  it('inventario de 4 specs E2E entrenamiento', () => {
    expect(countTrainingE2ESpecs()).toBe(4)
    expect(E2E_TRAINING_PLAYWRIGHT_SPECS.map((s) => s.id)).toEqual([
      'workout-flow',
      'training-full-flow',
      'workout-fuel-flow',
      'training-mega-flow',
    ])
  })

  it('mega spec cubre todo el flujo', () => {
    const mega = trainingMegaSpecEntry()
    expect(mega.id).toBe('training-mega-flow')
    expect(mega.covers).toEqual(['gym-log', 'fuel', 'sync', 'review'])
  })
})