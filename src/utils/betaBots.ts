/** Beta bots — personas de ambiente (Firestore uids `beta_bot_XX`). */

export const BETA_BOT_PREFIX = 'beta_bot_'
export const BETA_BOT_BADGE_LABEL = 'Beta · Persona IA'

export function isBetaBotId(id: string | undefined | null): boolean {
  if (!id) return false
  return id.startsWith(BETA_BOT_PREFIX)
}

export function isBetaBotProfile(profile: { isBetaBot?: boolean; id?: string } | null | undefined): boolean {
  if (!profile) return false
  if (profile.isBetaBot === true) return true
  return isBetaBotId(profile.id)
}
