import { describe, expect, it } from 'vitest'
import {
  countTrainingE2ESpecs,
  E2E_TRAINING_PLAYWRIGHT_SPECS,
  trainingE2EBlockRange,
  trainingMegaSpecEntry,
} from './e2eTrainingSuite'

describe('e2eTrainingSuite', () => {
  it('inventario de 6 specs E2E entrenamiento', () => {
    expect(countTrainingE2ESpecs()).toBe(6)
    expect(E2E_TRAINING_PLAYWRIGHT_SPECS.map((s) => s.id)).toEqual([
      'workout-flow',
      'training-full-flow',
      'workout-fuel-flow',
      'training-mega-flow',
      'workout-fab-flow',
      'workout-history-flow',
    ])
  })

  it('mega spec cubre todo el flujo', () => {
    const mega = trainingMegaSpecEntry()
    expect(mega.id).toBe('training-mega-flow')
    expect(mega.covers).toEqual(['gym-log', 'fuel', 'sync', 'review', 'banner', 'fuel-prefill'])
  })

  it('bloque E2E oleadas 378–400', () => {
    expect(trainingE2EBlockRange()).toEqual({ from: 378, to: 400 })
    const fab = E2E_TRAINING_PLAYWRIGHT_SPECS.find((s) => s.id === 'workout-fab-flow')
    expect(fab?.covers).toContain('fab')
    const workout = E2E_TRAINING_PLAYWRIGHT_SPECS.find((s) => s.id === 'workout-flow')
    expect(workout?.covers).toContain('banner')
    const fuel = E2E_TRAINING_PLAYWRIGHT_SPECS.find((s) => s.id === 'workout-fuel-flow')
    expect(fuel?.covers).toContain('banner')
    const history = E2E_TRAINING_PLAYWRIGHT_SPECS.find((s) => s.id === 'workout-history-flow')
    expect(history?.covers).toContain('history')
  })
})