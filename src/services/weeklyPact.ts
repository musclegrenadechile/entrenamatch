import type { WeekStats, WeeklyPact } from '../types'
import { getWeekKey } from '../utils/weekLiveTracker'

export type { WeeklyPact }

export interface WeeklyPactProgress {
  weekKey: string
  liveDaysDone: number
  liveDaysTarget: number
  syncSessionsDone: number
  syncSessionsTarget: number
  livePct: number
  syncPct: number
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

export function computeWeeklyPactProgress(
  pact: WeeklyPact | null | undefined,
  weekLiveDaysCount: number,
  weekStats: WeekStats | null | undefined,
  ref = new Date()
): WeeklyPactProgress {
  const weekKey = getWeekKey(ref)
  const pledged = isPactForCurrentWeek(pact, ref)
  const liveDaysTarget = pledged ? pact!.liveDaysTarget : 3
  const syncSessionsTarget = pledged ? pact!.syncSessionsTarget : 1

  const liveDaysDone = Math.max(
    weekLiveDaysCount,
    weekStats?.weekKey === weekKey ? weekStats.liveDays ?? 0 : 0
  )
  const syncSessionsDone =
    weekStats?.weekKey === weekKey ? estimateSyncSessions(weekStats.syncMinutes ?? 0) : 0

  const livePct = Math.min(100, Math.round((liveDaysDone / liveDaysTarget) * 100))
  const syncPct = Math.min(100, Math.round((syncSessionsDone / syncSessionsTarget) * 100))
  const overallPct = Math.round((livePct + syncPct) / 2)
  const isComplete =
    pledged && liveDaysDone >= liveDaysTarget && syncSessionsDone >= syncSessionsTarget

  return {
    weekKey,
    liveDaysDone,
    liveDaysTarget,
    syncSessionsDone,
    syncSessionsTarget,
    livePct,
    syncPct,
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
    partnerId,
    partnerName,
    pledgedAt: Date.now(),
  }
}

export function pactStatusLine(progress: WeeklyPactProgress): string {
  if (!progress.pledged) return 'Cierra tu semana con un compromiso claro'
  if (progress.isComplete) return 'Pacto cumplido — tu equipo lo siente'
  return `${progress.liveDaysDone}/${progress.liveDaysTarget} live · ${progress.syncSessionsDone}/${progress.syncSessionsTarget} sync`
}
