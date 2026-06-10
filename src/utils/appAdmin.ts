/** Community admin badge and helpers. */

export const COMMUNITY_ADMIN_BADGE_LABEL = 'Admin'

export function isCommunityAdminProfile(
  profile: { communityAdmin?: boolean; id?: string } | null | undefined,
  adminUids?: Set<string> | string[]
): boolean {
  if (!profile) return false
  if (profile.communityAdmin === true) return true
  if (!profile.id) return false
  if (adminUids) {
    const set = adminUids instanceof Set ? adminUids : new Set(adminUids)
    return set.has(profile.id)
  }
  return false
}
