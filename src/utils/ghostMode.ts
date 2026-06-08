/** Ghost mode (fase 114) — fuzzy public location ~500 m on GymPulse. */

export const GHOST_FUZZ_RADIUS_M = 500

/** Deterministic offset from user id so coords don't jump every heartbeat. */
export function fuzzPublicCoords(
  lat: number,
  lng: number,
  seed: string,
  radiusM = GHOST_FUZZ_RADIUS_M
): { lat: number; lng: number } {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }
  const angle = ((h >>> 0) % 360) * (Math.PI / 180)
  const dist = (((h >>> 8) % 1000) / 1000) * radiusM
  const dLat = (dist * Math.cos(angle)) / 111_320
  const cosLat = Math.cos((lat * Math.PI) / 180)
  const dLng = cosLat !== 0 ? (dist * Math.sin(angle)) / (111_320 * cosLat) : 0
  return { lat: lat + dLat, lng: lng + dLng }
}

export function applyGhostModeIfEnabled(
  lat: number,
  lng: number,
  ghostMode: boolean | undefined,
  userId: string
): { lat: number; lng: number; ghostMode: boolean } {
  if (!ghostMode) return { lat, lng, ghostMode: false }
  const fuzzed = fuzzPublicCoords(lat, lng, userId)
  return { ...fuzzed, ghostMode: true }
}
