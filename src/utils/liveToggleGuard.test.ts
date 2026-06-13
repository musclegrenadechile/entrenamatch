import { describe, expect, it } from 'vitest'
import {
  LIVE_PENDING_GUARD_MS,
  shouldIgnoreConflictingLiveSnapshot,
  shouldRejectStaleLiveOn,
  stripStaleLiveReactivation,
} from './liveToggleGuard'

describe('liveToggleGuard', () => {
  const now = 1_000_000
  const pendingOff = { trainingNow: false, at: now - 5_000 }
  const pendingOn = { trainingNow: true, at: now - 5_000 }
  const expired = { trainingNow: false, at: now - LIVE_PENDING_GUARD_MS - 1 }

  it('ignores Firestore true while pending OFF', () => {
    expect(shouldIgnoreConflictingLiveSnapshot(pendingOff, true, now)).toBe(true)
    expect(shouldIgnoreConflictingLiveSnapshot(pendingOff, false, now)).toBe(false)
  })

  it('ignores Firestore false while pending ON', () => {
    expect(shouldIgnoreConflictingLiveSnapshot(pendingOn, false, now)).toBe(true)
    expect(shouldIgnoreConflictingLiveSnapshot(pendingOn, true, now)).toBe(false)
  })

  it('stops guarding after window expires', () => {
    expect(shouldIgnoreConflictingLiveSnapshot(expired, true, now)).toBe(false)
  })

  it('rejects stale live on when local is off', () => {
    expect(shouldRejectStaleLiveOn(false, true, pendingOff, now)).toBe(true)
    expect(shouldRejectStaleLiveOn(false, true, null, now)).toBe(true)
    expect(shouldRejectStaleLiveOn(false, true, pendingOn, now)).toBe(false)
    expect(shouldRejectStaleLiveOn(true, true, pendingOff, now)).toBe(false)
    expect(shouldRejectStaleLiveOn(false, false, pendingOff, now)).toBe(false)
  })

  it('strips stale live reactivation from profile patches', () => {
    const patch = { trainingNow: true, trainingNowSince: 123, momentumPoints: 10 }
    expect(stripStaleLiveReactivation(patch, false, null, now)).toEqual({
      trainingNow: false,
      trainingNowSince: null,
      momentumPoints: 10,
    })
    expect(stripStaleLiveReactivation(patch, false, pendingOn, now)).toBe(patch)
    expect(stripStaleLiveReactivation(patch, true, null, now)).toBe(patch)
  })
})
