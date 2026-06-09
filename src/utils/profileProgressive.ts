/** Fase 88 — progressive profile: collapse advanced blocks first N days. */

export const PROFILE_PROGRESSIVE_DAYS = 7

export function getAccountAgeDays(user: {
  legalConsents?: { acceptedAt?: number }
} | null | undefined): number {
  const at = user?.legalConsents?.acceptedAt
  if (!at || !Number.isFinite(at)) return PROFILE_PROGRESSIVE_DAYS + 1
  return Math.floor((Date.now() - at) / (24 * 60 * 60 * 1000))
}

/** True when marketplace/coach/admin/advanced stats should start collapsed. */
export function isProfileProgressiveMode(user: Parameters<typeof getAccountAgeDays>[0]): boolean {
  return getAccountAgeDays(user) < PROFILE_PROGRESSIVE_DAYS
}
