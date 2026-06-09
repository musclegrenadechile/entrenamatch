import { describe, expect, it } from 'vitest'
import { detectWorkoutPRs, formatWorkoutPRSummary } from './workoutPR'
import type { Workout } from '../types'

describe('detectWorkoutPRs', () => {
  it('detects first-time exercise as PR when no history', () => {
    const prs = detectWorkoutPRs(
      [{ name: 'Press banca', sets: [{ reps: 8, weightKg: 60 }] }],
      []
    )
    expect(prs).toHaveLength(1)
    expect(prs[0].exercise).toBe('Press banca')
    expect(prs[0].weightKg).toBe(60)
  })

  it('does not flag PR when weight is lower than history', () => {
    const history: Workout[] = [
      {
        id: '1',
        userId: 'u',
        title: 'Prev',
        type: 'push',
        startedAt: 0,
        endedAt: 0,
        exercises: [{ name: 'Press banca', sets: [{ reps: 5, weightKg: 80 }] }],
        stats: { totalSets: 1, totalVolumeKg: 400, durationMin: 45, exerciseCount: 1 },
        source: 'manual',
      },
    ]
    const prs = detectWorkoutPRs(
      [{ name: 'Press banca', sets: [{ reps: 10, weightKg: 50 }] }],
      history
    )
    expect(prs).toHaveLength(0)
  })

  it('detects weight PR over history', () => {
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
    const prs = detectWorkoutPRs(
      [{ name: 'Press banca', sets: [{ reps: 5, weightKg: 75 }] }],
      history
    )
    expect(prs).toHaveLength(1)
    expect(prs[0].previousBest?.weightKg).toBe(70)
  })
})

describe('formatWorkoutPRSummary', () => {
  it('formats single PR', () => {
    expect(
      formatWorkoutPRSummary([{ exercise: 'Sentadilla', weightKg: 100, reps: 5 }])
    ).toContain('PR Sentadilla')
  })
})
