import { describe, expect, it } from 'vitest'
import {
  getLiveSessionExpiryReason,
  isLiveSessionActive,
  LIVE_MAX_SESSION_MS,
  LIVE_MISSING_SINCE_GRACE_MS,
  resolveLiveSessionStartMs,
} from './liveSessionPolicy'

describe('liveSessionPolicy', () => {
  const now = 1_700_000_000_000

  it('rejects missing trainingNowSince without recent presence', () => {
    expect(
      isLiveSessionActive({ trainingNow: true, trainingNowSince: null }, now)
    ).toBe(false)
    expect(getLiveSessionExpiryReason({ trainingNow: true }, now)).toBe('missing_since')
  })

  it('allows brief grace when presence updatedAt is fresh', () => {
    const presenceAt = now - 5 * 60_000
    expect(
      isLiveSessionActive(
        { trainingNow: true, presenceUpdatedAt: presenceAt },
        now
      )
    ).toBe(true)
    expect(resolveLiveSessionStartMs({ trainingNow: true, presenceUpdatedAt: presenceAt }, now)).toBe(
      presenceAt
    )
  })

  it('expires after max session duration', () => {
    const since = now - LIVE_MAX_SESSION_MS - 1
    expect(
      isLiveSessionActive({ trainingNow: true, trainingNowSince: since }, now)
    ).toBe(false)
    expect(
      getLiveSessionExpiryReason({ trainingNow: true, trainingNowSince: since }, now)
    ).toBe('max_duration')
  })

  it('expires when motion heartbeat is stale', () => {
    const since = now - 30 * 60_000
    const motionAt = now - 50 * 60_000
    expect(
      isLiveSessionActive(
        { trainingNow: true, trainingNowSince: since, liveMotionAt: motionAt },
        now
      )
    ).toBe(false)
    expect(
      getLiveSessionExpiryReason(
        { trainingNow: true, trainingNowSince: since, liveMotionAt: motionAt },
        now
      )
    ).toBe('heartbeat_stale')
  })

  it('missing since grace window is bounded', () => {
    const presenceAt = now - LIVE_MISSING_SINCE_GRACE_MS - 1
    expect(
      isLiveSessionActive({ trainingNow: true, presenceUpdatedAt: presenceAt }, now)
    ).toBe(false)
  })
})
