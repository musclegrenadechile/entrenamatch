import { describe, expect, it } from 'vitest'
import type { Workout } from '../types'
import {
  buildGymLogLivePRKeys,
  countGymLogLivePRs,
  getGymLogLivePRSetIndex,
  hasNewGymLogLivePRKeys,
} from './gymLogLivePR'

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

  it('buildGymLogLivePRKeys y hasNewGymLogLivePRKeys', () => {
    const keys = buildGymLogLivePRKeys(
      [{ name: 'Press banca', sets: [{ reps: 8, weightKg: 75 }] }],
      history
    )
    expect(keys).toEqual(new Set(['press banca:8:75']))
    expect(hasNewGymLogLivePRKeys(new Set(), keys)).toBe(true)
    expect(hasNewGymLogLivePRKeys(keys, keys)).toBe(false)
    expect(
      hasNewGymLogLivePRKeys(keys, new Set(['press banca:5:80']))
    ).toBe(true)
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