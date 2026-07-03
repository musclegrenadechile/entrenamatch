/** Seed/demo profile ids (Explore deck fillers for pre-alpha). Real Firebase uids are never `pN`. */
export { SEED_PROFILES, CHAT_OPENERS } from '../data/seedProfiles'

const SEED_ID_PATTERN = /^p\d+$/i

export function isSeedProfileId(id: string | undefined | null): boolean {
  if (!id) return false
  return SEED_ID_PATTERN.test(id)
}
