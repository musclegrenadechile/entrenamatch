import type { WeekStats, WeeklyPact, Workout } from '../types'
import { getWeekKey } from '../utils/weekLiveTracker'

export type { WeeklyPact }

export const DEFAULT_LOGGED_SESSIONS_TARGET = 3

export interface WeeklyPactProgress {
  weekKey: string
  liveDaysDone: number
  liveDaysTarget: number
  syncSessionsDone: number
  syncSessionsTarget: number
  loggedSessionsDone: number
  loggedSessionsTarget: number
  livePct: number
  syncPct: number
  loggedPct: number
  overallPct: number
  isComplete: boolean
  pledged: boolean
}

export const PACT_LIVE_OPTIONS = [2, 3, 4, 5] as const
export const PACT_SYNC_OPTIONS = [1, 2, 3] as const

export function isPactForCurrentWeek(pact: WeeklyPact | null | undefined, ref = new Date()): boolean {
  if (!pact?.weekKey) return false
  return pact.weekKey === getWeekKey(ref)
}

export function estimateSyncSessions(syncMinutes: number): number {
  if (syncMinutes <= 0) return 0
  if (syncMinutes < 12) return 1
  return Math.floor(syncMinutes / 15)
}

function localDateStr(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Count Entreno de Hoy logs whose endedAt falls in the current ISO week. */
export function countLoggedSessionsInWeek(
  workouts: Workout[],
  ref = new Date()
): number {
  const weekKey = getWeekKey(ref)
  const seenDays = new Set<string>()
  for (const w of workouts) {
    const ts = w.endedAt || w.startedAt
    if (getWeekKey(new Date(ts)) !== weekKey) continue
    seenDays.add(localDateStr(ts))
  }
  return seenDays.size
}

export function computeWeeklyPactProgress(
  pact: WeeklyPact | null | undefined,
  weekLiveDaysCount: number,
  weekStats: WeekStats | null | undefined,
  loggedSessionsCount = 0,
  ref = new Date()
): WeeklyPactProgress {
  const weekKey = getWeekKey(ref)
  const pledged = isPactForCurrentWeek(pact, ref)
  const liveDaysTarget = pledged ? pact!.liveDaysTarget : 3
  const syncSessionsTarget = pledged ? pact!.syncSessionsTarget : 1
  const loggedSessionsTarget = pledged
    ? pact!.loggedSessionsTarget ?? DEFAULT_LOGGED_SESSIONS_TARGET
    : DEFAULT_LOGGED_SESSIONS_TARGET

  const liveDaysDone = Math.max(
    weekLiveDaysCount,
    weekStats?.weekKey === weekKey ? weekStats.liveDays ?? 0 : 0
  )
  const syncSessionsDone =
    weekStats?.weekKey === weekKey ? estimateSyncSessions(weekStats.syncMinutes ?? 0) : 0
  const loggedSessionsDone = loggedSessionsCount

  const livePct = Math.min(100, Math.round((liveDaysDone / liveDaysTarget) * 100))
  const syncPct = Math.min(100, Math.round((syncSessionsDone / syncSessionsTarget) * 100))
  const loggedPct = Math.min(
    100,
    Math.round((loggedSessionsDone / loggedSessionsTarget) * 100)
  )
  const overallPct = Math.round((livePct + syncPct + loggedPct) / 3)
  const isComplete =
    pledged &&
    liveDaysDone >= liveDaysTarget &&
    syncSessionsDone >= syncSessionsTarget &&
    loggedSessionsDone >= loggedSessionsTarget

  return {
    weekKey,
    liveDaysDone,
    liveDaysTarget,
    syncSessionsDone,
    syncSessionsTarget,
    loggedSessionsDone,
    loggedSessionsTarget,
    livePct,
    syncPct,
    loggedPct,
    overallPct,
    isComplete,
    pledged,
  }
}

export function buildDefaultPact(
  partnerId?: string,
  partnerName?: string,
  ref = new Date()
): WeeklyPact {
  return {
    weekKey: getWeekKey(ref),
    liveDaysTarget: 3,
    syncSessionsTarget: 1,
    loggedSessionsTarget: DEFAULT_LOGGED_SESSIONS_TARGET,
    partnerId,
    partnerName,
    pledgedAt: Date.now(),
  }
}

export function pactStatusLine(progress: WeeklyPactProgress): string {
  if (!progress.pledged) return 'Cierra tu semana con una meta clara'
  if (progress.isComplete) return 'Semana sellada — tu equipo lo siente'
  return `${progress.liveDaysDone}/${progress.liveDaysTarget} live · ${progress.syncSessionsDone}/${progress.syncSessionsTarget} sync · ${progress.loggedSessionsDone}/${progress.loggedSessionsTarget} logs`
}
