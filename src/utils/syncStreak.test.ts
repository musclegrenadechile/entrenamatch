import { describe, expect, it } from 'vitest'
import {
  MIN_VERIFIED_SYNC_MINUTES,
  formatSyncStreakBadge,
  isVerifiedSyncDuration,
  nextSyncStreakAfterSession,
  syncStreakBoostForRating,
} from './syncStreak'

describe('syncStreak', () => {
  it('requires at least 15 minutes for a verified sync', () => {
    expect(MIN_VERIFIED_SYNC_MINUTES).toBe(15)
    expect(isVerifiedSyncDuration(14)).toBe(false)
    expect(isVerifiedSyncDuration(15)).toBe(true)
    expect(isVerifiedSyncDuration(45)).toBe(true)
  })

  it('increments streak only on verified sessions', () => {
    expect(nextSyncStreakAfterSession(3, 1)).toBe(3)
    expect(nextSyncStreakAfterSession(3, 14)).toBe(3)
    expect(nextSyncStreakAfterSession(3, 15)).toBe(4)
    expect(nextSyncStreakAfterSession(0, 20)).toBe(1)
  })

  it('applies rating boost only on verified sessions with rating >= 4', () => {
    expect(syncStreakBoostForRating(5, 10)).toBe(0)
    expect(syncStreakBoostForRating(3, 20)).toBe(0)
    expect(syncStreakBoostForRating(4, 15)).toBe(1)
    expect(syncStreakBoostForRating(5, 29)).toBe(2)
    expect(syncStreakBoostForRating(5, 60)).toBe(2)
  })

  it('formats badge without day suffix', () => {
    expect(formatSyncStreakBadge(0)).toBe('')
    expect(formatSyncStreakBadge(1)).toBe('1 sync')
    expect(formatSyncStreakBadge(7)).toBe('7 syncs')
  })
})
