/** Team = sync bonds + mutual matches (real gym partners). */

export function isTeamMemberId(
  profileId: string,
  syncBonds: Record<string, unknown>,
  matchIds: string[]
): boolean {
  if (!profileId) return false
  if (syncBonds[profileId]) return true
  return matchIds.includes(profileId)
}

export function buildTeamIdSet(
  syncBonds: Record<string, unknown>,
  matchIds: string[]
): Set<string> {
  const ids = new Set<string>()
  Object.keys(syncBonds || {}).forEach((id) => ids.add(id))
  matchIds.forEach((id) => ids.add(id))
  return ids
}
