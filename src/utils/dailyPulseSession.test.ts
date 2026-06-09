import { describe, expect, it } from 'vitest'
import { rollTrainingStreak, buildNewDayPulse } from './dailyPulseSession'

describe('rollTrainingStreak', () => {
  it('starts at 1 when no prior date', () => {
    expect(rollTrainingStreak(null, '2026-06-07', 0, false)).toBe(1)
  })

  it('increments when yesterday was active', () => {
    expect(rollTrainingStreak('2026-06-06', '2026-06-07', 4, false)).toBe(5)
  })

  it('holds streak when protected', () => {
    expect(rollTrainingStreak('2026-06-05', '2026-06-07', 4, true)).toBe(4)
  })
})

describe('buildNewDayPulse', () => {
  it('creates challenge and persists streak fields', () => {
    const { pulse, userUpdate } = buildNewDayPulse(
      { id: 'u1', dailyTrainingStreak: 2, momentumPoints: 40 },
      null,
      { p1: { bondLevel: 2 } },
      10,
      '2026-06-07'
    )
    expect(pulse.lastDate).toBe('2026-06-07')
    expect(pulse.currentChallenge?.title).toBeTruthy()
    expect(userUpdate.dailyTrainingStreak).toBe(1)
    expect(userUpdate.retentionLevel).toBeGreaterThan(0)
  })
})
