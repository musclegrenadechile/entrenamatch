import { describe, expect, it } from 'vitest'
import { buildWeekWorkoutSummary, getTopExerciseProgress } from './workoutProgress'
import type { Workout } from '../types'

const baseWorkout = (overrides: Partial<Workout> & { id: string; endedAt: number }): Workout => ({
  userId: 'u1',
  title: 'Test',
  type: 'push',
  startedAt: overrides.endedAt - 3_600_000,
  exercises: [{ name: 'Press banca', sets: [{ reps: 8, weightKg: 60 }] }],
  stats: { totalSets: 3, totalVolumeKg: 480, durationMin: 45, exerciseCount: 1 },
  source: 'manual',
  ...overrides,
})

describe('buildWeekWorkoutSummary', () => {
  it('aggregates sessions in the last 7 days', () => {
    const now = new Date('2026-06-07T15:00:00').getTime()
    const today = new Date('2026-06-07T12:00:00').getTime()
    const workouts = [
      baseWorkout({ id: '1', endedAt: today }),
      baseWorkout({ id: '2', endedAt: today - 86_400_000 }),
    ]
    const s = buildWeekWorkoutSummary(workouts, now)
    expect(s.totalSessions).toBe(2)
    expect(s.activeDays).toBe(2)
    expect(s.days).toHaveLength(7)
  })
})

describe('getTopExerciseProgress', () => {
  it('returns exercises sorted by session count', () => {
    const w1 = baseWorkout({ id: '1', endedAt: 1000 })
    const w2 = baseWorkout({
      id: '2',
      endedAt: 2000,
      exercises: [{ name: 'Press banca', sets: [{ reps: 6, weightKg: 70 }] }],
    })
    const top = getTopExerciseProgress([w1, w2], 2)
    expect(top[0].name).toBe('Press banca')
    expect(top[0].trend).toBe('up')
    expect(top[0].bestWeightKg).toBe(70)
  })
})
