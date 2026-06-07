import type { GymCheckIn, Profile, WeekStats } from '../types'
import { getWeekKey } from '../utils/weekLiveTracker'
import { getDistanceKm } from '../utils'

export const WEEKLY_CITY_CHALLENGE_TARGET_MINUTES = 500

export function normalizeCity(city?: string | null): string {
  if (!city?.trim()) return ''
  return city
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function mergeWeekStats(
  existing: WeekStats | undefined,
  weekKey: string,
  minutesAdded: number,
  liveDaysCount: number,
  syncMinutesAdded = 0
): WeekStats {
  const base =
    existing?.weekKey === weekKey
      ? existing
      : { weekKey, liveMinutes: 0, syncMinutes: 0, liveDays: 0, updatedAt: Date.now() }
  return {
    weekKey,
    liveMinutes: base.liveMinutes + minutesAdded,
    syncMinutes: (base.syncMinutes ?? 0) + syncMinutesAdded,
    liveDays: Math.max(base.liveDays, liveDaysCount),
    updatedAt: Date.now(),
  }
}

export function weekTotalMinutes(stats: WeekStats | null | undefined): number {
  if (!stats) return 0
  return stats.liveMinutes + (stats.syncMinutes ?? 0)
}

export type LeaderboardEntry = {
  userId: string
  name: string
  liveMinutes: number
  syncMinutes: number
  totalMinutes: number
  liveDays: number
  liveStreak: number
  isMe?: boolean
}

export type CityChallenge = {
  cityLabel: string
  targetMinutes: number
  currentMinutes: number
  participants: number
  weekKey: string
  progressPct: number
}

export type PartnerGym = {
  id: string
  name: string
  lat: number
  lng: number
  address?: string
  city?: string
}

function isLeaderboardVisible(p: { showOnLeaderboard?: boolean }): boolean {
  return p.showOnLeaderboard !== false
}

function statsForWeek(stats: WeekStats | undefined, weekKey: string): WeekStats | null {
  if (!stats || stats.weekKey !== weekKey) return null
  return stats
}

export function buildCityLeaderboard(
  profiles: Profile[],
  cityNorm: string,
  self: {
    userId: string
    name: string
    stats?: WeekStats
    liveStreak?: number
    showOnLeaderboard?: boolean
  },
  weekKey = getWeekKey()
): LeaderboardEntry[] {
  if (!cityNorm) return []

  const byId = new Map<string, LeaderboardEntry>()

  for (const p of profiles) {
    if (normalizeCity(p.city) !== cityNorm) continue
    if (!isLeaderboardVisible(p)) continue
    const stats = statsForWeek(p.weekStats, weekKey)
    const liveMinutes = stats?.liveMinutes ?? 0
    const syncMinutes = stats?.syncMinutes ?? 0
    const totalMinutes = liveMinutes + syncMinutes
    const days = stats?.liveDays ?? 0
    if (totalMinutes === 0 && days === 0) continue
    byId.set(p.id, {
      userId: p.id,
      name: p.name,
      liveMinutes,
      syncMinutes,
      totalMinutes,
      liveDays: days,
      liveStreak: p.liveStreak ?? 0,
      isMe: p.id === self.userId,
    })
  }

  if (isLeaderboardVisible(self)) {
    const selfStats = statsForWeek(self.stats, weekKey)
    const liveMinutes = selfStats?.liveMinutes ?? 0
    const syncMinutes = selfStats?.syncMinutes ?? 0
    const totalMinutes = liveMinutes + syncMinutes
    const days = selfStats?.liveDays ?? 0
    if (totalMinutes > 0 || days > 0) {
      byId.set(self.userId, {
        userId: self.userId,
        name: self.name,
        liveMinutes,
        syncMinutes,
        totalMinutes,
        liveDays: days,
        liveStreak: self.liveStreak ?? 0,
        isMe: true,
      })
    }
  }

  return Array.from(byId.values())
    .sort(
      (a, b) =>
        b.totalMinutes - a.totalMinutes ||
        b.liveDays - a.liveDays ||
        b.liveStreak - a.liveStreak
    )
    .slice(0, 8)
}

export function buildCityChallenge(
  profiles: Profile[],
  cityNorm: string,
  cityLabel: string,
  selfStats?: WeekStats,
  selfUserId?: string,
  weekKey = getWeekKey()
): CityChallenge | null {
  if (!cityNorm) return null

  let totalMinutes = 0
  let participants = 0
  const counted = new Set<string>()

  for (const p of profiles) {
    if (normalizeCity(p.city) !== cityNorm) continue
    if (!isLeaderboardVisible(p)) continue
    const stats = statsForWeek(p.weekStats, weekKey)
    const mins = weekTotalMinutes(stats)
    if (mins <= 0) continue
    totalMinutes += mins
    counted.add(p.id)
    participants++
  }

  if (selfUserId && selfStats?.weekKey === weekKey) {
    const selfTotal = weekTotalMinutes(selfStats)
    if (selfTotal > 0 && !counted.has(selfUserId)) {
      totalMinutes += selfTotal
      participants++
    }
  }

  const target = WEEKLY_CITY_CHALLENGE_TARGET_MINUTES
  const progressPct = Math.min(100, Math.round((totalMinutes / target) * 100))

  return {
    cityLabel: cityLabel || cityNorm,
    targetMinutes: target,
    currentMinutes: totalMinutes,
    participants,
    weekKey,
    progressPct,
  }
}

export function findNearestGym(
  gyms: PartnerGym[],
  userLat: number,
  userLng: number,
  maxKm = 0.6
): (PartnerGym & { distanceKm: number }) | null {
  let best: (PartnerGym & { distanceKm: number }) | null = null
  for (const gym of gyms) {
    const lat = Number(gym.lat)
    const lng = Number(gym.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    const distanceKm = getDistanceKm(userLat, userLng, lat, lng)
    if (distanceKm > maxKm) continue
    if (!best || distanceKm < best.distanceKm) {
      best = { ...gym, lat, lng, distanceKm }
    }
  }
  return best
}

export function isGymCheckInFresh(checkIn?: GymCheckIn | null, maxAgeMs = 8 * 60 * 60 * 1000): boolean {
  if (!checkIn?.checkedInAt) return false
  return Date.now() - checkIn.checkedInAt < maxAgeMs
}

export function formatLeaderboardMinutes(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  return `${minutes} min`
}

export type LiveUserWithGym = {
  id?: string
  gymCheckIn?: GymCheckIn | null
  trainingNow?: boolean
}

/** How many live users checked in at a partner gym right now. */
export function countLiveAtGym(liveUsers: LiveUserWithGym[], gymId: string): number {
  if (!gymId) return 0
  return (liveUsers || []).filter(
    (u) => u.trainingNow !== false && u.gymCheckIn?.gymId === gymId
  ).length
}

/** Live users at a gym (for map popups / squad invites). */
export function listLiveAtGym(liveUsers: LiveUserWithGym[], gymId: string): LiveUserWithGym[] {
  if (!gymId) return []
  return (liveUsers || []).filter(
    (u) => u.trainingNow !== false && u.gymCheckIn?.gymId === gymId
  )
}
