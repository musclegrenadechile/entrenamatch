/**
 * GymPulse Map 2.0 — marker diffing (Fase 110).
 * Reuses Leaflet markers by stable key instead of full rebuild each tick.
 */

import type { Marker } from 'leaflet'

export type MarkerPool = Map<string, Marker>

export function markerPoolKey(kind: 'live' | 'cluster' | 'partner', id: string | number): string {
  return `${kind}:${id}`
}

export function pruneMarkerPool(
  pool: MarkerPool,
  activeKeys: Set<string>,
  removeLayer: (m: Marker) => void
): void {
  for (const [key, marker] of pool) {
    if (!activeKeys.has(key)) {
      try {
        removeLayer(marker)
      } catch {
        /* ignore */
      }
      pool.delete(key)
    }
  }
}

export function liveMarkerSignature(u: {
  lat?: number
  lng?: number
  photos?: string[]
  visibleLevel?: number
  isNetworkBond?: boolean
  seVaEnMin?: number
  joinCount?: number
  gymCheckIn?: { gymName?: string }
  liveMotionIdle?: boolean
}): string {
  return [
    u.lat,
    u.lng,
    u.photos?.[0],
    u.visibleLevel,
    u.isNetworkBond,
    u.seVaEnMin,
    u.joinCount,
    u.gymCheckIn?.gymName,
    u.liveMotionIdle,
  ].join('|')
}

export function partnerMarkerSignature(p: {
  lat?: number
  lng?: number
  logoUrl?: string
  logo?: string
  hubStrength?: number
  type?: string
  liveAtGym?: number
}): string {
  return [p.lat, p.lng, p.logoUrl || p.logo, p.hubStrength, p.type, p.liveAtGym].join('|')
}

/** Grid cells for density heat halos (Fase 107). */
export function computeHeatCells(
  users: Array<{ lat?: number; lng?: number }>,
  cellDeg = 0.012
): Map<string, { lat: number; lng: number; count: number }> {
  const cells = new Map<string, { lat: number; lng: number; count: number }>()
  for (const u of users) {
    if (u.lat == null || u.lng == null) continue
    const gx = Math.floor(u.lat / cellDeg)
    const gy = Math.floor(u.lng / cellDeg)
    const key = `${gx}:${gy}`
    const prev = cells.get(key)
    if (prev) prev.count += 1
    else cells.set(key, { lat: u.lat, lng: u.lng, count: 1 })
  }
  return cells
}
