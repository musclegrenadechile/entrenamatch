import { describe, expect, it } from 'vitest'
import {
  canReadLivePresence,
  canWriteLivePresence,
} from './livePresence.rules.test'

/** Fase 83 — Firestore rules contract (unit mirror; extend with emulator later). */

export function canReadProfilePosts(isAuthenticated: boolean): boolean {
  return isAuthenticated
}

export function canWriteOwnProfilePost(
  isAuthenticated: boolean,
  authUid: string | null,
  postUserId: string
): boolean {
  return isAuthenticated && !!authUid && authUid === postUserId
}

export function canReadDirectMessage(
  isAuthenticated: boolean,
  authUid: string | null,
  from: string,
  to: string
): boolean {
  return isAuthenticated && !!authUid && (authUid === from || authUid === to)
}

export function canWriteDirectMessage(
  isAuthenticated: boolean,
  authUid: string | null,
  from: string
): boolean {
  return isAuthenticated && !!authUid && authUid === from
}

describe('Firestore rules contract (fase 83)', () => {
  describe('livePresence', () => {
    it('read requires auth', () => {
      expect(canReadLivePresence(false)).toBe(false)
      expect(canReadLivePresence(true)).toBe(true)
    })

    it('write only own doc', () => {
      expect(canWriteLivePresence(true, 'u1', 'u1')).toBe(true)
      expect(canWriteLivePresence(true, 'u1', 'u2')).toBe(false)
    })
  })

  describe('profilePosts', () => {
    it('read requires auth', () => {
      expect(canReadProfilePosts(false)).toBe(false)
      expect(canReadProfilePosts(true)).toBe(true)
    })

    it('create/update only own posts', () => {
      expect(canWriteOwnProfilePost(true, 'u1', 'u1')).toBe(true)
      expect(canWriteOwnProfilePost(true, 'u1', 'u2')).toBe(false)
    })
  })

  describe('messages', () => {
    it('read only participants', () => {
      expect(canReadDirectMessage(true, 'a', 'a', 'b')).toBe(true)
      expect(canReadDirectMessage(true, 'c', 'a', 'b')).toBe(false)
    })

    it('write only as sender', () => {
      expect(canWriteDirectMessage(true, 'a', 'a')).toBe(true)
      expect(canWriteDirectMessage(true, 'a', 'b')).toBe(false)
    })
  })
})
