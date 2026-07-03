/** Fase 88 / 101 / 103 — progressive profile & home. */

export const PROFILE_PROGRESSIVE_DAYS = 7

export function getAccountAgeDays(user: {
  legalConsents?: { acceptedAt?: number }
} | null | undefined): number {
  const at = user?.legalConsents?.acceptedAt
  if (!at || !Number.isFinite(at)) return PROFILE_PROGRESSIVE_DAYS + 1
  return Math.floor((Date.now() - at) / (24 * 60 * 60 * 1000))
}

/** True when marketplace/coach/advanced stats should start collapsed. */
export function isProfileProgressiveMode(user: Parameters<typeof getAccountAgeDays>[0]): boolean {
  return getAccountAgeDays(user) < PROFILE_PROGRESSIVE_DAYS
}

/** Tab Hoy compacto — primeros 7 días: foco LIVE + Explorar (sin Fuel/coach/marketplace). */
export const HOME_COMPACT_DAYS = 7

export function isHomeDayOneMode(user: Parameters<typeof getAccountAgeDays>[0]): boolean {
  return getAccountAgeDays(user) < HOME_COMPACT_DAYS
}

/** EntrenaSync bonds needed to unlock coach/marketplace before day 7. */
export const PROFILE_PROGRESSIVE_SYNC_UNLOCK = 2

/**
 * Hide EntrenaCoach + marketplace during FTUE unless user is 7+ days old
 * or has completed at least 2 EntrenaSync bonds (fase 112).
 */
export function shouldHideCoachAndMarketplace(
  user: Parameters<typeof getAccountAgeDays>[0],
  completedSyncCount = 0
): boolean {
  if (getAccountAgeDays(user) >= PROFILE_PROGRESSIVE_DAYS) return false
  return completedSyncCount < PROFILE_PROGRESSIVE_SYNC_UNLOCK
}
