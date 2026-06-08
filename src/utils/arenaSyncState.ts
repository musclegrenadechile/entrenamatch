/** Live participant state synced via syncSessions (Arena 2.0 Sala Sync). */

import type { WorkoutExercise } from '../types'

export interface ArenaParticipantLiveState {
  activeExercise: string
  pendingReps: number
  pendingWeightKg: number
  setCount?: number
  exercises?: WorkoutExercise[]
  updatedAt: number
}

export const ARENA_REST_MS = 90_000

function parseExercises(raw: unknown): WorkoutExercise[] {
  if (!Array.isArray(raw)) return []
  const out: WorkoutExercise[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    if (typeof o.name !== 'string' || !Array.isArray(o.sets)) continue
    const sets = o.sets
      .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
      .map((s) => ({
        reps: typeof s.reps === 'number' ? s.reps : 0,
        weightKg: typeof s.weightKg === 'number' ? s.weightKg : 0,
      }))
    if (sets.length === 0 && o.name.trim() === '') continue
    out.push({ name: o.name, sets })
  }
  return out
}

export function parseParticipantState(
  raw: unknown,
  userId: string
): ArenaParticipantLiveState | null {
  if (!raw || typeof raw !== 'object' || !userId) return null
  const entry = (raw as Record<string, unknown>)[userId]
  if (!entry || typeof entry !== 'object') return null
  const o = entry as Record<string, unknown>
  const exercises = parseExercises(o.exercises)
  const activeExercise =
    typeof o.activeExercise === 'string' && o.activeExercise.trim()
      ? o.activeExercise
      : exercises.length > 0
        ? exercises[exercises.length - 1].name
        : null
  if (!activeExercise) return null
  return {
    activeExercise,
    pendingReps: typeof o.pendingReps === 'number' ? o.pendingReps : 10,
    pendingWeightKg: typeof o.pendingWeightKg === 'number' ? o.pendingWeightKg : 0,
    setCount: typeof o.setCount === 'number' ? o.setCount : exercises.reduce((n, e) => n + e.sets.length, 0),
    exercises,
    updatedAt: typeof o.updatedAt === 'number' ? o.updatedAt : 0,
  }
}

export function restSecondsLeft(restUntil: number | null | undefined, now = Date.now()): number {
  if (!restUntil || restUntil <= now) return 0
  return Math.ceil((restUntil - now) / 1000)
}
