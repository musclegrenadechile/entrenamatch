import { EXERCISE_LIBRARY, getLibraryExercise } from '../data/exerciseLibrary'
import type { WorkoutExercise, WorkoutSet, WorkoutType } from '../types'
import {
  emptySetForExercise,
  normalizeWorkoutExercise,
} from './workoutSetFields'
import { resolveVoiceExerciseAlias } from './workoutVoiceAliases'
import { expandAllVoiceExercises } from './workoutVoiceExpandSets'

const VALID_TYPES = new Set<WorkoutType>(['push', 'pull', 'legs', 'full', 'cardio', 'other'])

export type WorkoutVoiceParseResult = {
  transcript: string
  title: string
  type: WorkoutType
  durationMin: number
  confidence: number
  exercises: Array<{
    name: string
    sets: Array<{
      reps: number
      weightKg: number
      minutesMin?: number
      intensity?: number
    }>
  }>
  source?: string
  geminiModel?: string
}

/** Fuzzy match exercise name to library (Spanish gym). */
export function resolveExerciseLibraryName(
  rawName: string,
  recentNames: string[] = []
): string {
  const q = rawName.trim()
  if (!q) return 'Ejercicio'

  const alias = resolveVoiceExerciseAlias(q)
  if (alias) {
    if (alias === 'Cardio') return q
    const fromAlias = getLibraryExercise(alias)
    if (fromAlias) return fromAlias.name
    return alias
  }

  const exact = getLibraryExercise(q)
  if (exact) return exact.name

  const lower = q.toLowerCase()
  for (const recent of recentNames) {
    if (recent.toLowerCase() === lower) return recent
  }

  const incl = EXERCISE_LIBRARY.find((e) => e.name.toLowerCase().includes(lower))
  if (incl) return incl.name
  const rev = EXERCISE_LIBRARY.find((e) => lower.includes(e.name.toLowerCase()))
  if (rev) return rev.name

  return q
}

function mapVoiceSet(exerciseName: string, s: WorkoutVoiceParseResult['exercises'][0]['sets'][0]): WorkoutSet {
  const base = emptySetForExercise(exerciseName)
  return {
    ...base,
    reps: Math.max(0, Math.round(s.reps || 0)),
    weightKg: Math.max(0, Number(s.weightKg) || 0),
    ...(s.minutesMin != null ? { minutesMin: Math.max(1, Math.round(s.minutesMin)) } : {}),
    ...(s.intensity != null
      ? { intensity: Math.min(10, Math.max(1, Math.round(s.intensity))) }
      : {}),
  }
}

/** Convert Gemini JSON → Entreno de hoy state. */
export function applyWorkoutVoiceParse(
  parsed: WorkoutVoiceParseResult,
  recentNames: string[] = []
): {
  title: string
  type: WorkoutType
  durationMin: number
  exercises: WorkoutExercise[]
  transcript: string
  confidence: number
} {
  const type = VALID_TYPES.has(parsed.type as WorkoutType) ? parsed.type : 'full'
  const durationMin = Math.min(240, Math.max(5, Math.round(parsed.durationMin || 45)))

  const expanded = expandAllVoiceExercises(parsed.exercises || [])

  const exercises: WorkoutExercise[] = expanded.map((ex) => {
    const name = resolveExerciseLibraryName(ex.name, recentNames)
    const sets =
      ex.sets?.length > 0
        ? ex.sets.map((s) => mapVoiceSet(name, s))
        : [emptySetForExercise(name)]
    return normalizeWorkoutExercise({ name, sets })
  })

  return {
    title: (parsed.title || 'Entreno de hoy').trim().slice(0, 80),
    type,
    durationMin,
    exercises,
    transcript: parsed.transcript || '',
    confidence: parsed.confidence ?? 0.5,
  }
}
