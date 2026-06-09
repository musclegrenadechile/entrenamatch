import { describe, expect, it } from 'vitest'
import { mergePRsIntoMap, topExercisePRs } from '../services/exercisePRs'

describe('exercisePRs (fase 95)', () => {
  it('merges new PRs into map', () => {
    const { map, updated } = mergePRsIntoMap(
      {},
      [{ exercise: 'Press banca', weightKg: 80, reps: 5 }],
      'w1'
    )
    expect(updated).toHaveLength(1)
    expect(map['press banca'].weightKg).toBe(80)
  })

  it('does not downgrade existing PR', () => {
    const existing = {
      'press banca': {
        exerciseKey: 'press banca',
        exerciseName: 'Press banca',
        weightKg: 90,
        reps: 3,
        achievedAt: 1,
      },
    }
    const { updated } = mergePRsIntoMap(
      existing,
      [{ exercise: 'Press banca', weightKg: 70, reps: 10 }],
      'w2'
    )
    expect(updated).toHaveLength(0)
  })

  it('returns recent PRs first', () => {
    const map = {
      a: {
        exerciseKey: 'a',
        exerciseName: 'A',
        weightKg: 50,
        reps: 5,
        achievedAt: 100,
      },
      b: {
        exerciseKey: 'b',
        exerciseName: 'B',
        weightKg: 60,
        reps: 5,
        achievedAt: 200,
      },
    }
    expect(topExercisePRs(map, 1)[0].exerciseName).toBe('B')
  })
})
