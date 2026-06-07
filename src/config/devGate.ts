/**
 * Partner map editor gate — password comes from env, never hardcoded in source.
 * Set VITE_DEV_MAP_PASSWORD locally or in CI secrets for trusted builds only.
 * Firestore mapEditors/{uid} is the server-side enforcement (see firestore.rules).
 */
export const DEV_MAP_PASSWORD = (import.meta.env.VITE_DEV_MAP_PASSWORD as string | undefined)?.trim() || ''

export function isDevPasswordConfigured(): boolean {
  return DEV_MAP_PASSWORD.length >= 8
}

export function verifyDevMapPassword(input: string): boolean {
  if (!isDevPasswordConfigured()) return false
  return input === DEV_MAP_PASSWORD
}
