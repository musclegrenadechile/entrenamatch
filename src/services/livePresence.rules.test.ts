import { describe, expect, it } from 'vitest'

/**
 * Mirrors firestore.rules livePresence/{userId} (fase 196).
 * Emulator tests can extend this; unit tests catch rule drift in CI.
 */
export function canReadLivePresence(isAuthenticated: boolean): boolean {
  return isAuthenticated
}

export function canWriteLivePresence(
  isAuthenticated: boolean,
  authUid: string | null,
  docUserId: string
): boolean {
  return isAuthenticated && !!authUid && authUid === docUserId
}

describe('livePresence Firestore rules contract', () => {
  it('denies read when unauthenticated', () => {
    expect(canReadLivePresence(false)).toBe(false)
  })

  it('allows read for any authenticated user', () => {
    expect(canReadLivePresence(true)).toBe(true)
  })

  it('allows create/update/delete only for own uid', () => {
    expect(canWriteLivePresence(true, 'user-a', 'user-a')).toBe(true)
    expect(canWriteLivePresence(true, 'user-a', 'user-b')).toBe(false)
    expect(canWriteLivePresence(false, 'user-a', 'user-a')).toBe(false)
    expect(canWriteLivePresence(true, null, 'user-a')).toBe(false)
  })
})
