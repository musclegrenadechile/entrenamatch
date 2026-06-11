/** Minimum EntrenaSync duration (minutes) to count toward sync session stats. */
export const MIN_VERIFIED_SYNC_MINUTES = 15

export function isVerifiedSyncDuration(minutes: number): boolean {
  return Number.isFinite(minutes) && minutes >= MIN_VERIFIED_SYNC_MINUTES
}

/** +1 session when duration qualifies; otherwise unchanged. */
export function nextSyncStreakAfterSession(current: number, minutes: number): number {
  const base = Math.max(0, Math.floor(current) || 0)
  return base + (isVerifiedSyncDuration(minutes) ? 1 : 0)
}

/** Bonus syncs from a high rating on a verified session (0 if ineligible). */
export function syncStreakBoostForRating(rating: number, minutes: number): number {
  if (!isVerifiedSyncDuration(minutes) || rating < 4) return 0
  return Math.min(2, Math.floor(minutes / 10))
}

export function formatSyncStreakBadge(count: number): string {
  const n = Math.max(0, Math.floor(count) || 0)
  if (n <= 0) return ''
  return n === 1 ? '1 sync' : `${n} syncs`
}
