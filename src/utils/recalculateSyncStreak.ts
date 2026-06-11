import { isVerifiedSyncDuration, MIN_VERIFIED_SYNC_MINUTES } from './syncStreak'

export type SyncRatingEvidence = {
  partnerId?: string
  minutes?: number
  ts?: number
}

export type SyncWorkoutEvidence = {
  id: string
  syncSessionId?: string | null
  durationMin: number
  endedAt?: number
  partnerId?: string | null
}

export type PilotSyncEvidence = {
  sessionId: string
  durationMin: number
  endedAt?: number
}

/** Distinct verified session keys (≥15 min) from all evidence sources. */
export function collectVerifiedSyncSessionKeys(
  ratings: SyncRatingEvidence[] | null | undefined,
  workouts: SyncWorkoutEvidence[],
  pilotSessions: PilotSyncEvidence[]
): Set<string> {
  const keys = new Set<string>()

  for (const rating of ratings || []) {
    const minutes = Number(rating.minutes) || 0
    if (!isVerifiedSyncDuration(minutes)) continue
    const ts = Number(rating.ts) || 0
    const partner = String(rating.partnerId || 'unknown')
    keys.add(`rating:${ts}:${partner}`)
  }

  for (const workout of workouts) {
    if (!isVerifiedSyncDuration(workout.durationMin)) continue
    if (workout.syncSessionId) {
      keys.add(`session:${workout.syncSessionId}`)
      continue
    }
    keys.add(`workout:${workout.id}`)
  }

  for (const session of pilotSessions) {
    if (!isVerifiedSyncDuration(session.durationMin)) continue
    keys.add(`session:${session.sessionId}`)
  }

  return keys
}

export function countVerifiedSyncStreak(
  ratings: SyncRatingEvidence[] | null | undefined,
  workouts: SyncWorkoutEvidence[],
  pilotSessions: PilotSyncEvidence[]
): number {
  return collectVerifiedSyncSessionKeys(ratings, workouts, pilotSessions).size
}

export function shouldUpdateSyncStreak(stored: number | null | undefined, recalculated: number): boolean {
  const prev = Math.max(0, Math.floor(stored ?? 0) || 0)
  const next = Math.max(0, Math.floor(recalculated) || 0)
  return prev !== next
}

export { MIN_VERIFIED_SYNC_MINUTES }
