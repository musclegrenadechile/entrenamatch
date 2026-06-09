import { describe, expect, it } from 'vitest'
import { compareSyncWorkoutLogs, statsFromExercises } from './workoutSyncCompare'

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
