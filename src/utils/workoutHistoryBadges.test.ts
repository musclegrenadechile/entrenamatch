import { describe, expect, it } from 'vitest'
import { buildWorkoutHistoryBadges } from './workoutHistoryBadges'
import type { Workout } from '../types'

function workout(
  id: string,
  source: Workout['source'],
  exercises: Workout['exercises']
): Workout {
  return {
    id,
    userId: 'me',
    title: 'Test',
    type: 'strength',
    startedAt: 1,
    endedAt: 2,
    exercises,
    stats: { totalSets: 1, totalVolumeKg: 100, durationMin: 30 },
    source,
  }
}

describe('buildWorkoutHistoryBadges', () => {
  it('marca sync y PR cuando aplica', () => {
    const prior = [
      workout('old', 'manual', [
        { name: 'Press banca', sets: [{ reps: 8, weightKg: 60 }] },
      ]),
    ]
    const current = workout('new', 'sync', [
      { name: 'Press banca', sets: [{ reps: 10, weightKg: 70 }] },
    ])

    expect(buildWorkoutHistoryBadges(current, prior)).toEqual([
      { kind: 'sync', label: 'Sync' },
      { kind: 'pr', label: '1 PR' },
    ])
  })

  it('sin badges si no hay sync ni PR', () => {
    const prior = [
      workout('old', 'manual', [
        { name: 'Press banca', sets: [{ reps: 10, weightKg: 70 }] },
      ]),
    ]
    const current = workout('new', 'manual', [
      { name: 'Press banca', sets: [{ reps: 8, weightKg: 60 }] },
    ])

    expect(buildWorkoutHistoryBadges(current, prior)).toEqual([])
  })
})