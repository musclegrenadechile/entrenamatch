import { describe, expect, it } from 'vitest'
import {
  collectVerifiedSyncSessionKeys,
  countVerifiedSyncStreak,
  shouldUpdateSyncStreak,
} from './recalculateSyncStreak'

describe('recalculateSyncStreak', () => {
  it('counts only sessions at or above 15 minutes', () => {
    expect(
      countVerifiedSyncStreak(
        [{ partnerId: 'p2', minutes: 14, ts: 100 }],
        [],
        []
      )
    ).toBe(0)

    expect(
      countVerifiedSyncStreak(
        [{ partnerId: 'p2', minutes: 15, ts: 100 }],
        [],
        []
      )
    ).toBe(1)
  })

  it('dedupes workout and pilot session by syncSessionId', () => {
    const keys = collectVerifiedSyncSessionKeys(
      [],
      [{ id: 'w1', syncSessionId: 'sync_a_b', durationMin: 20 }],
      [{ sessionId: 'sync_a_b', durationMin: 20 }]
    )
    expect(keys.size).toBe(1)
    expect(countVerifiedSyncStreak([], [{ id: 'w1', syncSessionId: 'sync_a_b', durationMin: 20 }], [])).toBe(1)
  })

  it('merges ratings, workouts and pilot sessions', () => {
    expect(
      countVerifiedSyncStreak(
        [{ partnerId: 'p2', minutes: 18, ts: 1 }],
        [{ id: 'w9', durationMin: 30 }],
        [{ sessionId: 'sync_x_y', durationMin: 25 }]
      )
    ).toBe(3)
  })

  it('detects when profile syncStreak needs update', () => {
    expect(shouldUpdateSyncStreak(5, 1)).toBe(true)
    expect(shouldUpdateSyncStreak(2, 2)).toBe(false)
    expect(shouldUpdateSyncStreak(undefined, 0)).toBe(false)
    expect(shouldUpdateSyncStreak(3, 0)).toBe(true)
  })
})
