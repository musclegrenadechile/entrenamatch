/** Live participant state synced via syncSessions (Arena 2.0 Sala Sync). */

export interface ArenaParticipantLiveState {
  activeExercise: string
  pendingReps: number
  pendingWeightKg: number
  setCount?: number
  updatedAt: number
}

export const ARENA_REST_MS = 90_000

export function parseParticipantState(
  raw: unknown,
  userId: string
): ArenaParticipantLiveState | null {
  if (!raw || typeof raw !== 'object' || !userId) return null
  const entry = (raw as Record<string, unknown>)[userId]
  if (!entry || typeof entry !== 'object') return null
  const o = entry as Record<string, unknown>
  if (typeof o.activeExercise !== 'string') return null
  return {
    activeExercise: o.activeExercise,
    pendingReps: typeof o.pendingReps === 'number' ? o.pendingReps : 10,
    pendingWeightKg: typeof o.pendingWeightKg === 'number' ? o.pendingWeightKg : 0,
    setCount: typeof o.setCount === 'number' ? o.setCount : 0,
    updatedAt: typeof o.updatedAt === 'number' ? o.updatedAt : 0,
  }
}

export function restSecondsLeft(restUntil: number | null | undefined, now = Date.now()): number {
  if (!restUntil || restUntil <= now) return 0
  return Math.ceil((restUntil - now) / 1000)
}
