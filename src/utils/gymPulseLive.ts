/**
 * GymPulse live-user helpers — shared between App.tsx and GymPulseMap.
 * Single place for session TTL, coords checks, and enrichment.
 */

export const ASSUMED_LIVE_SESSION_MS = 3 * 60 * 60 * 1000

export function normalizeTrainingSince(val: unknown): number | undefined {
  if (val == null) return undefined
  if (typeof val === 'number' && Number.isFinite(val)) return val
  const v = val as { toMillis?: () => number; seconds?: number; nanoseconds?: number }
  if (typeof v.toMillis === 'function') return v.toMillis()
  if (typeof v.seconds === 'number') {
    return v.seconds * 1000 + Math.floor((v.nanoseconds || 0) / 1_000_000)
  }
  const n = Number(val)
  return Number.isFinite(n) ? n : undefined
}

export function hasMapCoords(u: { lat?: unknown; lng?: unknown } | null | undefined): boolean {
  if (!u) return false
  return Number.isFinite(Number(u.lat)) && Number.isFinite(Number(u.lng))
}

export function isActiveLiveUser(p: any, now = Date.now()): boolean {
  if (!p?.trainingNow) return false
  const since = Number(normalizeTrainingSince(p.trainingNowSince) || 0)
  if (since <= 0) return true // grace: live flag set but since not yet written
  return now - since < ASSUMED_LIVE_SESSION_MS
}

export type LiveUserLike = Record<string, any>

export function mergeLiveUsersById(sources: LiveUserLike[][]): LiveUserLike[] {
  const byId = new Map<string, LiveUserLike>()
  for (const list of sources) {
    for (const p of list || []) {
      if (!p?.id) continue
      const prev = byId.get(p.id)
      byId.set(p.id, { ...prev, ...p, trainingNow: true })
    }
  }
  return Array.from(byId.values())
}

export function enrichLiveUser(
  p: LiveUserLike,
  now: number,
  opts: {
    userLocation?: { lat: number; lng: number } | null
    syncBonds?: Record<string, { bondLevel?: number }>
    getDistanceKm?: (lat1: number, lng1: number, lat2: number, lng2: number) => number
  } = {}
): LiveUserLike {
  const since = Number(normalizeTrainingSince(p.trainingNowSince) || now)
  const remainingMs = Math.max(0, ASSUMED_LIVE_SESSION_MS - (now - since))
  const seVaEnMin = Math.ceil(remainingMs / 60_000)
  let lat = Number(p.lat)
  let lng = Number(p.lng)
  if (!Number.isFinite(lat)) lat = -33.02
  if (!Number.isFinite(lng)) lng = -71.55
  let distance = typeof p.distance === 'number' ? p.distance : 999
  if (opts.userLocation && opts.getDistanceKm && hasMapCoords({ lat, lng })) {
    distance = opts.getDistanceKm(opts.userLocation.lat, opts.userLocation.lng, lat, lng)
  }
  const bond = opts.syncBonds?.[p.id]
  const visibleLevel = p.retentionLevel || bond?.bondLevel || 1
  return {
    ...p,
    lat,
    lng,
    trainingNow: true,
    trainingNowSince: since,
    distance,
    seVaEnMin,
    joinCount: p.liveJoins ?? p.joinCount ?? 0,
    isLegend: !!bond && (bond.bondLevel || 0) >= 3,
    visibleLevel,
  }
}

export function filterMapLiveUsers(
  users: LiveUserLike[],
  opts: {
    mapNearOnly?: boolean
    userLocation?: { lat: number; lng: number } | null
    selectedMapZone?: string | null
    showOnlyLegends?: boolean
    getDistanceKm?: (lat1: number, lng1: number, lat2: number, lng2: number) => number
  }
): LiveUserLike[] {
  const { mapNearOnly, userLocation, selectedMapZone, showOnlyLegends, getDistanceKm } = opts
  return (users || []).filter((u) => {
    if (!isActiveLiveUser(u)) return false
    if (!hasMapCoords(u)) return false
    let dist = typeof u.distance === 'number' ? u.distance : 999
    if (userLocation && getDistanceKm && hasMapCoords(u)) {
      dist = getDistanceKm(userLocation.lat, userLocation.lng, Number(u.lat), Number(u.lng))
    }
    if (mapNearOnly && userLocation && dist >= 10) return false
    if (selectedMapZone && u.city !== selectedMapZone) return false
    if (showOnlyLegends && !u.isLegend) return false
    return true
  })
}

export function profileDocToLiveUser(id: string, data: Record<string, any>): LiveUserLike {
  return {
    id,
    name: data.name || 'Usuario',
    age: data.age || 25,
    gender: data.gender || 'hombre',
    city: data.city || '',
    country: data.country || 'Chile',
    lat: Number.isFinite(Number(data.lat)) ? Number(data.lat) : -33.02,
    lng: Number.isFinite(Number(data.lng)) ? Number(data.lng) : -71.55,
    bio: data.bio || '',
    photos: data.photos || [],
    trainingTypes: data.trainingTypes || [],
    goals: data.goals || [],
    level: data.level || 'Intermedio',
    availability: data.availability || ['Tarde'],
    intensity: data.intensity,
    verificationStatus: data.verificationStatus,
    trainingNow: true,
    trainingNowSince: normalizeTrainingSince(data.trainingNowSince) || Date.now(),
    liveStreak: data.liveStreak,
    lastLiveDate: data.lastLiveDate,
    liveJoins: data.liveJoins,
    joinedLiveStreak: data.joinedLiveStreak,
    trainingSyncWith: data.trainingSyncWith,
    syncStreak: data.syncStreak,
    syncBonds: data.syncBonds || {},
    retentionLevel: data.retentionLevel || 1,
  }
}
