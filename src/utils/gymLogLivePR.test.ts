import { describe, expect, it } from 'vitest'
import type { Workout } from '../types'
import { countGymLogLivePRs, getGymLogLivePRSetIndex } from './gymLogLivePR'

const history: Workout[] = [
  {
    id: '1',
    userId: 'u',
    title: 'Prev',
    type: 'push',
    startedAt: 0,
    endedAt: 0,
    exercises: [{ name: 'Press banca', sets: [{ reps: 5, weightKg: 70 }] }],
    stats: { totalSets: 1, totalVolumeKg: 350, durationMin: 45, exerciseCount: 1 },
    source: 'manual',
  },
]

describe('gymLogLivePR', () => {
  it('getGymLogLivePRSetIndex sin historial — primera serie es PR', () => {
    expect(
      getGymLogLivePRSetIndex('Press banca', [{ reps: 8, weightKg: 60 }], [])
    ).toBe(0)
  })

  it('getGymLogLivePRSetIndex no marca PR si no supera historial', () => {
    expect(
      getGymLogLivePRSetIndex('Press banca', [{ reps: 10, weightKg: 50 }], history)
    ).toBeNull()
  })

  it('getGymLogLivePRSetIndex marca la mejor serie que supera historial', () => {
    const sets = [
      { reps: 5, weightKg: 72 },
      { reps: 8, weightKg: 65 },
    ]
    expect(getGymLogLivePRSetIndex('Press banca', sets, history)).toBe(0)
  })

  it('getGymLogLivePRSetIndex ignora cardio', () => {
    expect(
      getGymLogLivePRSetIndex(
        'Cinta / caminadora',
        [{ reps: 0, weightKg: 0, minutesMin: 20, intensity: 6 }],
        []
      )
    ).toBeNull()
  })

  it('countGymLogLivePRs', () => {
    expect(
      countGymLogLivePRs(
        [
          { name: 'Press banca', sets: [{ reps: 5, weightKg: 75 }] },
          { name: 'Sentadilla libre', sets: [{ reps: 5, weightKg: 100 }] },
        ],
        history
      )
    ).toBe(2)
  })
})