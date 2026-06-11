/** Beta bots — personas de ambiente (Firestore uids `beta_bot_XX`). */

export const BETA_BOT_PREFIX = 'beta_bot_'
export const BETA_BOT_BADGE_LABEL = 'Beta · Persona IA'

/** Pausa temporal en cliente — menos listeners y re-renders mientras hay lag. */
export const BETA_BOTS_PAUSED = true

export function shouldHideBetaBot(id: string | undefined | null): boolean {
  return BETA_BOTS_PAUSED && isBetaBotId(id)
}

export function isBetaBotId(id: string | undefined | null): boolean {
  if (!id) return false
  return id.startsWith(BETA_BOT_PREFIX)
}

export function isBetaBotProfile(profile: { isBetaBot?: boolean; id?: string } | null | undefined): boolean {
  if (!profile) return false
  if (profile.isBetaBot === true) return true
  return isBetaBotId(profile.id)
}
