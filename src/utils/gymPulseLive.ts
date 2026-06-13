/**
 * GymPulse live-user helpers — shared between App.tsx and GymPulseMap.
 * Single place for session TTL, coords checks, and enrichment.
 */

import { deriveLiveMotionIdle } from './liveMotionScore'
import {
  ASSUMED_LIVE_SESSION_MS,
  isLiveSessionActive,
  liveSessionRemainingMs,
  resolveLiveSessionStartMs,
} from './liveSessionPolicy'

export { ASSUMED_LIVE_SESSION_MS }

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
  return isLiveSessionActive(
    {
      trainingNow: p?.trainingNow,
      trainingNowSince: p?.trainingNowSince,
      liveMotionAt: p?.liveMotionAt,
      liveMotionIdle: p?.liveMotionIdle,
      liveActivityState: p?.liveActivityState,
      presenceUpdatedAt: p?.presenceUpdatedAt ?? p?.updatedAt,
    },
    now
  )
}

export type LiveUserLike = Record<string, any>

function looksLikeLiveUser(row: unknown): row is LiveUserLike {
  return !!row && typeof row === 'object' && typeof (row as LiveUserLike).id === 'string'
}

/** Normalize legacy calls that passed a flat user[] instead of LiveUserLike[][]. */
function normalizeMergeSources(sources: LiveUserLike[][] | LiveUserLike[]): LiveUserLike[][] {
  if (!sources || !Array.isArray(sources) || sources.length === 0) return []
  if (looksLikeLiveUser(sources[0])) {
    return [sources as LiveUserLike[]]
  }
  return (sources as LiveUserLike[][]).map((list) => (Array.isArray(list) ? list : []))
}

export function mergeLiveUsersById(sources: LiveUserLike[][] | LiveUserLike[]): LiveUserLike[] {
  const byId = new Map<string, LiveUserLike>()
  for (const list of normalizeMergeSources(sources)) {
    for (const p of list) {
      if (!p?.id) continue
      const prev = byId.get(p.id)
      const merged = { ...prev, ...p }
      merged.trainingNow = !!(p.trainingNow || prev?.trainingNow)
      byId.set(p.id, merged)
    }
  }
  return Array.from(byId.values()).filter((u) => u.trainingNow)
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
  const since = resolveLiveSessionStartMs(
    {
      trainingNow: true,
      trainingNowSince: p.trainingNowSince,
      presenceUpdatedAt: p.presenceUpdatedAt ?? p.updatedAt,
    },
    now
  ) || now
  const remainingMs = liveSessionRemainingMs(
    {
      trainingNow: true,
      trainingNowSince: since,
      liveMotionAt: p.liveMotionAt,
      presenceUpdatedAt: p.presenceUpdatedAt ?? p.updatedAt,
    },
    now
  )
  const seVaEnMin = Math.ceil(remainingMs / 60_000)
  let lat = Number(p.lat)
  let lng = Number(p.lng)
  if (!Number.isFinite(lat)) lat = -33.02
  if (!Number.isFinite(lng)) lng = -71.55
  let distance: number | undefined =
    typeof p.distance === 'number' && p.distance < 900 ? p.distance : undefined
  if (opts.userLocation && opts.getDistanceKm && hasMapCoords({ lat, lng })) {
    distance = opts.getDistanceKm(opts.userLocation.lat, opts.userLocation.lng, lat, lng)
  }
  const bond = opts.syncBonds?.[p.id]
  const visibleLevel = p.retentionLevel || bond?.bondLevel || 1
  const liveMotionScore =
    typeof p.liveMotionScore === 'number' ? p.liveMotionScore : undefined
  const liveMotionAt = typeof p.liveMotionAt === 'number' ? p.liveMotionAt : undefined
  const liveMotionIdle = deriveLiveMotionIdle(liveMotionScore, liveMotionAt, now)
  return {
    ...p,
    lat,
    lng,
    trainingNow: true,
    trainingNowSince: since,
    distance,
    seVaEnMin,
    joinCount: p.liveJoins ?? p.joinCount ?? 0,
    isNetworkBond: !!bond && (bond.bondLevel || 0) >= 3,
    visibleLevel,
    liveMotionScore,
    liveMotionAt,
    liveMotionIdle,
    liveActivityState: p.liveActivityState,
  }
}

export function filterMapLiveUsers(
  users: LiveUserLike[],
  opts: {
    mapNearOnly?: boolean
    userLocation?: { lat: number; lng: number } | null
    selectedMapZone?: string | null
    showOnlyNetwork?: boolean
    mapMyGymId?: string | null
    getDistanceKm?: (lat1: number, lng1: number, lat2: number, lng2: number) => number
  }
): LiveUserLike[] {
  const { mapNearOnly, userLocation, selectedMapZone, showOnlyNetwork, mapMyGymId, getDistanceKm } = opts
  return (users || []).filter((u) => {
    if (!isActiveLiveUser(u)) return false
    if (!hasMapCoords(u)) return false
    let dist = typeof u.distance === 'number' ? u.distance : 999
    if (userLocation && getDistanceKm && hasMapCoords(u)) {
      dist = getDistanceKm(userLocation.lat, userLocation.lng, Number(u.lat), Number(u.lng))
    }
    if (mapMyGymId && u.gymCheckIn?.gymId !== mapMyGymId) return false
    if (mapNearOnly && userLocation && dist >= 10) return false
    if (selectedMapZone && u.city !== selectedMapZone) return false
    if (showOnlyNetwork && !u.isNetworkBond) return false
    return true
  })
}

export function sortLiveUsersForSheet(
  users: LiveUserLike[],
  syncBonds: Record<string, { bondLevel?: number }> = {},
  selfUserId?: string | null
): LiveUserLike[] {
  return [...(users || [])]
    .filter((u) => isActiveLiveUser(u) && hasMapCoords(u) && u.id !== selfUserId)
    .sort((a, b) => {
      const aBond = syncBonds[a.id]?.bondLevel || 0
      const bBond = syncBonds[b.id]?.bondLevel || 0
      if (aBond !== bBond) return bBond - aBond
      return (a.distance ?? 999) - (b.distance ?? 999)
    })
}

export function isUserLiveInSnapshot(
  userId: string,
  liveUsers: LiveUserLike[],
  now = Date.now()
): boolean {
  if (!userId) return false
  const u = liveUsers.find((p) => p.id === userId)
  return u ? isActiveLiveUser(u, now) : false
}

export function profileDocToLiveUser(
  id: string,
  data: Record<string, any>,
  opts?: { forceLive?: boolean }
): LiveUserLike {
  const isLive = opts?.forceLive === true || data.trainingNow === true
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
    trainingNow: isLive,
    trainingNowSince: resolveLiveSessionStartMs({
      trainingNow: isLive,
      trainingNowSince: data.trainingNowSince,
      presenceUpdatedAt: data.updatedAt ?? data.presenceUpdatedAt,
    }),
    liveStreak: data.liveStreak,
    lastLiveDate: data.lastLiveDate,
    liveJoins: data.liveJoins,
    joinedLiveStreak: data.joinedLiveStreak,
    trainingSyncWith: data.trainingSyncWith,
    syncStreak: data.syncStreak,
    syncBonds: data.syncBonds || {},
    retentionLevel: data.retentionLevel || 1,
    gymCheckIn: data.gymCheckIn || undefined,
    liveMotionScore: typeof data.liveMotionScore === 'number' ? data.liveMotionScore : undefined,
    liveMotionAt: typeof data.liveMotionAt === 'number' ? data.liveMotionAt : undefined,
    liveMotionIdle: data.liveMotionIdle === true,
    liveActivityState: data.liveActivityState,
    spotifyShareLive: data.spotifyShareLive === true,
    spotifyNowPlaying:
      data.spotifyNowPlaying && typeof data.spotifyNowPlaying === 'object'
        ? data.spotifyNowPlaying
        : undefined,
    gymSoundAnthem:
      data.gymSoundAnthem && typeof data.gymSoundAnthem === 'object'
        ? data.gymSoundAnthem
        : undefined,
  }
}
