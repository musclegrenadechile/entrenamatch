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

export function countLiveInCity(
  liveUsers: Array<{ city?: string; trainingNow?: boolean }>,
  cityNorm: string
): number {
  if (!cityNorm) return 0
  return (liveUsers || []).filter(
    (u) => u.trainingNow !== false && normalizeCity(u.city) === cityNorm
  ).length
}

export function findLeaderboardRank(
  leaderboard: LeaderboardEntry[],
  userId: string
): number | null {
  const idx = leaderboard.findIndex((e) => e.userId === userId || e.isMe)
  return idx >= 0 ? idx + 1 : null
}

/** Leaderboard scoped to one partner gym (Fase 21). */
export function buildGymLeaderboard(
  profiles: Profile[],
  gymId: string,
  self: {
    userId: string
    name: string
    stats?: WeekStats
    liveStreak?: number
    gymCheckIn?: GymCheckIn
    showOnLeaderboard?: boolean
  },
  weekKey = getWeekKey()
): LeaderboardEntry[] {
  if (!gymId) return []

  const byId = new Map<string, LeaderboardEntry>()

  const consider = (userId: string, name: string, stats: WeekStats | null | undefined, liveStreak: number, isMe: boolean) => {
    if (!stats) return
    const liveMinutes = stats.liveMinutes ?? 0
    const syncMinutes = stats.syncMinutes ?? 0
    const totalMinutes = liveMinutes + syncMinutes
    if (totalMinutes === 0 && (stats.liveDays ?? 0) === 0) return
    byId.set(userId, {
      userId,
      name,
      liveMinutes,
      syncMinutes,
      totalMinutes,
      liveDays: stats.liveDays ?? 0,
      liveStreak,
      isMe,
    })
  }

  for (const p of profiles) {
    if (p.gymCheckIn?.gymId !== gymId && p.id !== self.userId) continue
    if (!isLeaderboardVisible(p)) continue
    if (p.gymCheckIn?.gymId !== gymId) continue
    consider(p.id, p.name, statsForWeek(p.weekStats, weekKey), p.liveStreak ?? 0, p.id === self.userId)
  }

  if (isLeaderboardVisible(self) && self.gymCheckIn?.gymId === gymId) {
    consider(self.userId, self.name, statsForWeek(self.stats, weekKey), self.liveStreak ?? 0, true)
  }

  return Array.from(byId.values())
    .sort((a, b) => b.totalMinutes - a.totalMinutes || b.liveDays - a.liveDays)
    .slice(0, 10)
}

export type CityChallengeV2 = CityChallenge & {
  cityRank: number
  topCities: Array<{ city: string; minutes: number; rank: number }>
  rewardTier: 'bronze' | 'silver' | 'gold' | null
}

/** City challenge v2 — ranking + tier premio (Fase 22). */
export function buildCityChallengeV2(
  profiles: Profile[],
  cityNorm: string,
  cityLabel: string,
  allCityTotals: Array<{ cityNorm: string; cityLabel: string; minutes: number }>,
  selfStats?: WeekStats,
  selfUserId?: string,
  weekKey = getWeekKey()
): CityChallengeV2 | null {
  const base = buildCityChallenge(profiles, cityNorm, cityLabel, selfStats, selfUserId, weekKey)
  if (!base) return null

  const sorted = [...allCityTotals].sort((a, b) => b.minutes - a.minutes)
  const topCities = sorted.slice(0, 5).map((c, i) => ({
    city: c.cityLabel || c.cityNorm,
    minutes: c.minutes,
    rank: i + 1,
  }))
  const cityRank = sorted.findIndex((c) => c.cityNorm === cityNorm) + 1

  let rewardTier: CityChallengeV2['rewardTier'] = null
  if (base.progressPct >= 100) rewardTier = 'gold'
  else if (base.progressPct >= 75) rewardTier = 'silver'
  else if (base.progressPct >= 50) rewardTier = 'bronze'

  return { ...base, cityRank: cityRank > 0 ? cityRank : sorted.length + 1, topCities, rewardTier }
}

/** Aggregate live+sync minutes per city for ranking (Fase 22). */
export function aggregateCityTotals(
  profiles: Profile[],
  weekKey = getWeekKey()
): Array<{ cityNorm: string; cityLabel: string; minutes: number }> {
  const map = new Map<string, { cityNorm: string; cityLabel: string; minutes: number }>()
  for (const p of profiles) {
    const norm = normalizeCity(p.city)
    if (!norm) continue
    const mins = weekTotalMinutes(statsForWeek(p.weekStats, weekKey))
    if (mins <= 0) continue
    const cur = map.get(norm)
    if (cur) cur.minutes += mins
    else map.set(norm, { cityNorm: norm, cityLabel: (p.city || norm).trim(), minutes: mins })
  }
  return Array.from(map.values())
}

/** Extend merged city challenge with v2 ranking fields. */
export function enrichCityChallengeV2(
  base: CityChallenge,
  cityNorm: string,
  allCityTotals: Array<{ cityNorm: string; cityLabel: string; minutes: number }>
): CityChallengeV2 {
  const sorted = [...allCityTotals].sort((a, b) => b.minutes - a.minutes)
  const topCities = sorted.slice(0, 5).map((c, i) => ({
    city: c.cityLabel || c.cityNorm,
    minutes: c.minutes,
    rank: i + 1,
  }))
  const cityRank = sorted.findIndex((c) => c.cityNorm === cityNorm) + 1
  let rewardTier: CityChallengeV2['rewardTier'] = null
  if (base.progressPct >= 100) rewardTier = 'gold'
  else if (base.progressPct >= 75) rewardTier = 'silver'
  else if (base.progressPct >= 50) rewardTier = 'bronze'
  return {
    ...base,
    cityRank: cityRank > 0 ? cityRank : sorted.length + 1,
    topCities,
    rewardTier,
  }
}
