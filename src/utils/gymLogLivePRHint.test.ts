import { describe, expect, it } from 'vitest'
import { buildGymLogLivePRHint } from './gymLogLivePRHint'

describe('gymLogLivePRHint', () => {
  it('primer récord sin historial', () => {
    expect(
      buildGymLogLivePRHint({ exercise: 'Press banca', weightKg: 60, reps: 10 })
    ).toBe('Primer récord en este ejercicio')
  })

  it('delta de peso', () => {
    expect(
      buildGymLogLivePRHint({
        exercise: 'Press banca',
        weightKg: 75,
        reps: 5,
        previousBest: { weightKg: 70, reps: 5 },
      })
    ).toBe('+5 kg vs 70 kg')
  })

  it('delta de reps mismo peso', () => {
    expect(
      buildGymLogLivePRHint({
        exercise: 'Press banca',
        weightKg: 70,
        reps: 8,
        previousBest: { weightKg: 70, reps: 5 },
      })
    ).toBe('+3 reps vs 5×70 kg')
  })

  it('vacío si no hay PR', () => {
    expect(buildGymLogLivePRHint(null)).toBe('')
  })
})