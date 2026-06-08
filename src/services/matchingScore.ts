/**
 * Matching score — wraps calculateCompatibility + timezone proximity (Fase 26).
 */

import { calculateCompatibility } from '../utils'

/** Hour buckets for availability overlap (morning/afternoon/evening). */
function hourBucket(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

/** Bonus if both users likely train same part of day (timezone-aware hint). */
export function timezoneTrainingBonus(
  myTzOffsetMin: number | undefined,
  profileTzOffsetMin: number | undefined
): number {
  if (typeof myTzOffsetMin !== 'number' || typeof profileTzOffsetMin !== 'number') return 0
  const diffHours = Math.abs(myTzOffsetMin - profileTzOffsetMin) / 60
  if (diffHours <= 1) return 8
  if (diffHours <= 3) return 4
  return 0
}

export function computeMatchScore(
  currentUser: Parameters<typeof calculateCompatibility>[0],
  profile: Parameters<typeof calculateCompatibility>[1],
  userLoc: { lat: number; lng: number } | null,
  opts?: { myTzOffsetMin?: number; profileTzOffsetMin?: number }
): number {
  let score = calculateCompatibility(currentUser, profile, userLoc)
  score += timezoneTrainingBonus(opts?.myTzOffsetMin, opts?.profileTzOffsetMin)
  return Math.min(100, Math.round(score))
}

export { hourBucket }
