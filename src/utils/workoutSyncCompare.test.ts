import { describe, expect, it } from 'vitest'
import { compareSyncWorkoutLogs, statsFromExercises, summarizePartnerWeekFromWorkouts } from './workoutSyncCompare'

describe('statsFromExercises', () => {
  it('sums sets and volume', () => {
    const s = statsFromExercises([
      { name: 'Press banca', sets: [{ reps: 10, weightKg: 50 }, { reps: 8, weightKg: 55 }] },
    ])
    expect(s.sets).toBe(2)
    expect(s.volumeKg).toBe(940)
    expect(s.exercises).toBe(1)
  })
})

describe('compareSyncWorkoutLogs', () => {
  it('returns null when both sides empty', () => {
    expect(compareSyncWorkoutLogs([], [])).toBeNull()
  })

  it('picks winner by volume', () => {
    const self = [{ name: 'Press', sets: [{ reps: 10, weightKg: 60 }] }]
    const partner = [{ name: 'Press', sets: [{ reps: 10, weightKg: 40 }] }]
    const cmp = compareSyncWorkoutLogs(self, partner)!
    expect(cmp.winner).toBe('self')
    expect(cmp.self.volumeKg).toBeGreaterThan(cmp.partner.volumeKg)
  })
})

describe('summarizePartnerWeekFromWorkouts', () => {
  it('counts sessions in last 7 days', () => {
    const now = new Date('2026-06-07T12:00:00').getTime()
    const summary = summarizePartnerWeekFromWorkouts(
      [
        {
          id: '1',
          userId: 'p',
          title: 'A',
          type: 'push',
          startedAt: now - 86_400_000,
          endedAt: now - 86_400_000,
          exercises: [],
          stats: { totalSets: 12, totalVolumeKg: 1000, durationMin: 45, exerciseCount: 3 },
          source: 'manual',
        },
      ],
      now
    )
    expect(summary.sessions).toBe(1)
    expect(summary.totalSets).toBe(12)
  })
})
