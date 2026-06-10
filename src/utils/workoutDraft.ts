import { isTimedCardioExercise } from '../data/exerciseLibrary'
import type { WorkoutExercise, WorkoutType } from '../types'
import { normalizeWorkoutSet } from './workoutSetFields'

const DRAFT_KEY = 'workout_draft'
const RECENT_KEY = 'workout_recent_exercises'
const MAX_DRAFT_AGE_MS = 48 * 60 * 60 * 1000
/** Sin editar el borrador — reiniciar cronómetro (sesión probablemente abandonada). */
export const STALE_DRAFT_EDIT_MS = 30 * 60 * 1000
/** Tiempo de sesión imposible — reiniciar cronómetro. */
export const MAX_SESSION_ELAPSED_MS = 4 * 60 * 60 * 1000
const MAX_RECENT = 12

export type WorkoutDraft = {
  title: string
  type: WorkoutType
  durationMin: number
  exercises: WorkoutExercise[]
  startedAt: number | null
  updatedAt: number
}

function draftStorageKey(userId: string): string {
  return `${DRAFT_KEY}_${userId}`
}

function recentStorageKey(userId: string): string {
  return `${RECENT_KEY}_${userId}`
}

export function isWorkoutDraftFresh(draft: WorkoutDraft | null): boolean {
  if (!draft?.exercises?.length) return false
  return Date.now() - draft.updatedAt < MAX_DRAFT_AGE_MS
}

export function loadWorkoutDraft(userId: string): WorkoutDraft | null {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(draftStorageKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as WorkoutDraft
    if (!parsed?.exercises?.length) return null
    return parsed
  } catch {
    return null
  }
}

export function saveWorkoutDraft(userId: string, draft: WorkoutDraft): void {
  if (!userId || !draft.exercises.length) return
  try {
    localStorage.setItem(
      draftStorageKey(userId),
      JSON.stringify({ ...draft, updatedAt: Date.now() })
    )
  } catch {
    /* quota / private mode */
  }
}

export function clearWorkoutDraft(userId: string): void {
  if (!userId) return
  try {
    localStorage.removeItem(draftStorageKey(userId))
  } catch {
    /* ignore */
  }
}

export function loadRecentExerciseNames(userId: string): string[] {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(recentStorageKey(userId))
    const list = raw ? (JSON.parse(raw) as string[]) : []
    return Array.isArray(list) ? list.filter((n) => typeof n === 'string').slice(0, MAX_RECENT) : []
  } catch {
    return []
  }
}

export function pushRecentExerciseNames(userId: string, names: string[]): void {
  if (!userId || !names.length) return
  const prev = loadRecentExerciseNames(userId)
  const merged = [...names, ...prev].filter((n, i, arr) => arr.indexOf(n) === i).slice(0, MAX_RECENT)
  try {
    localStorage.setItem(recentStorageKey(userId), JSON.stringify(merged))
  } catch {
    /* ignore */
  }
}

export function formatDraftAge(updatedAt: number): string {
  const min = Math.max(1, Math.floor((Date.now() - updatedAt) / 60_000))
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  return h < 24 ? `hace ${h} h` : 'ayer'
}

export function resolveDraftStartedAt(draft: WorkoutDraft): { startedAt: number | null; timerReset: boolean } {
  if (!draft.exercises.length) return { startedAt: null, timerReset: false }
  const now = Date.now()
  if (!draft.startedAt) return { startedAt: now, timerReset: false }
  const idleMs = now - draft.updatedAt
  const elapsedMs = now - draft.startedAt
  if (idleMs > STALE_DRAFT_EDIT_MS || elapsedMs > MAX_SESSION_ELAPSED_MS) {
    return { startedAt: now, timerReset: true }
  }
  return { startedAt: draft.startedAt, timerReset: false }
}

export function elapsedWorkoutMinutes(startedAt: number | null): number {
  if (!startedAt) return 0
  return Math.max(1, Math.floor((Date.now() - startedAt) / 60_000))
}

export function formatWorkoutSessionTimer(startedAt: number | null, now = Date.now()): string | null {
  if (!startedAt) return null
  const totalSec = Math.max(0, Math.floor((now - startedAt) / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export type WorkoutDraftSummary = {
  exerciseCount: number
  currentExerciseName: string
  timer: string | null
}

/** Fase D — duplica la última serie del ejercicio actual en el borrador. */
export function quickAddSetToWorkoutDraft(userId: string): {
  ok: boolean
  exerciseName?: string
} {
  const draft = loadWorkoutDraft(userId)
  if (!draft?.exercises?.length) return { ok: false }
  const exercises = draft.exercises.map((ex) => ({
    ...ex,
    sets: [...ex.sets],
  }))
  const ex = exercises[exercises.length - 1]
  if (!ex.sets.length) return { ok: false }
  const last = normalizeWorkoutSet(ex.name, ex.sets[ex.sets.length - 1])
  if (isTimedCardioExercise(ex.name)) {
    ex.sets.push({
      reps: 0,
      weightKg: 0,
      minutesMin: last.minutesMin || 15,
      intensity: last.intensity || 6,
    })
  } else {
    ex.sets.push({ reps: last.reps || 10, weightKg: last.weightKg || 0 })
  }
  saveWorkoutDraft(userId, { ...draft, exercises, updatedAt: Date.now() })
  return { ok: true, exerciseName: ex.name?.trim() || 'Entreno' }
}

export function summarizeWorkoutDraft(draft: WorkoutDraft): WorkoutDraftSummary {
  const last = draft.exercises[draft.exercises.length - 1]
  return {
    exerciseCount: draft.exercises.length,
    currentExerciseName: last?.name?.trim() || 'Entreno',
    timer: formatWorkoutSessionTimer(draft.startedAt),
  }
}
