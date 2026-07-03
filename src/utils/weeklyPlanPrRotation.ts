import type { Workout, WorkoutType } from '../types'
import { WORKOUT_TYPE_LABELS } from '../data/exerciseLibrary'
import { inferDominantMuscle } from '../domain/fuelBalance/inferDominantMuscle'
import type { WeeklyTrainingLoad } from '../domain/weeklyPlan/types'
import { detectWorkoutPRs } from './workoutPR'

const MAX_PR_AGE_MS = 7 * 86_400_000

const MUSCLE_TO_TYPE: Record<string, WorkoutType> = {
  Pecho: 'push',
  Hombros: 'push',
  Espalda: 'pull',
  Piernas: 'legs',
  Glúteos: 'legs',
  'Full body': 'full',
  Cardio: 'cardio',
}

const ROTATION_AFTER: Record<WorkoutType, WorkoutType[]> = {
  push: ['pull', 'legs', 'full'],
  pull: ['legs', 'push', 'full'],
  legs: ['push', 'pull', 'full'],
  full: ['cardio', 'push', 'pull'],
  cardio: ['push', 'pull', 'full'],
  other: ['full', 'push', 'pull'],
}

/** Músculos con PR en el entreno más reciente (≤7 días). */
export function collectRecentPrMuscleGroups(
  workouts: Workout[],
  now = Date.now()
): string[] {
  if (!workouts.length) return []
  const latest = workouts[0]
  const endedAt = latest.endedAt || latest.startedAt
  if (now - endedAt > MAX_PR_AGE_MS) return []

  const prs = detectWorkoutPRs(latest.exercises || [], workouts.slice(1))
  const muscles = new Set<string>()
  for (const pr of prs) {
    const muscle = inferDominantMuscle([
      { name: pr.exercise, sets: [{ reps: pr.reps, weightKg: pr.weightKg }] },
    ])
    if (muscle) muscles.add(muscle)
  }
  return [...muscles]
}

export function workoutTypeForPrMuscle(muscle: string): WorkoutType | undefined {
  return MUSCLE_TO_TYPE[muscle]
}

/** Evita repetir el tipo de entreno del grupo muscular que acaba de marcar PR. */
export function applyPrRotationToSuggestedType(
  suggested: WorkoutType,
  prMuscles: string[],
  lastType?: WorkoutType
): WorkoutType {
  if (!prMuscles.length) return suggested
  const blockedTypes = new Set(
    prMuscles.map(workoutTypeForPrMuscle).filter((t): t is WorkoutType => !!t)
  )
  if (!blockedTypes.has(suggested)) return suggested

  const seed = lastType && blockedTypes.has(lastType) ? lastType : suggested
  const options = ROTATION_AFTER[seed] || ['full', 'pull', 'legs', 'push']
  return options.find((t) => !blockedTypes.has(t)) || options[0] || 'full'
}

export function buildWeeklyPlanPrRotationNote(
  prMuscles: string[],
  suggestedType: WorkoutType
): string | null {
  if (!prMuscles.length) return null
  const typeLabel = WORKOUT_TYPE_LABELS[suggestedType] || suggestedType
  if (prMuscles.length === 1) {
    return `Tras PR en ${prMuscles[0]} — rotación a ${typeLabel}.`
  }
  return `Tras PR reciente — rotación a ${typeLabel}.`
}

export function enhanceTrainingLoadWithPrRotation(
  load: WeeklyTrainingLoad,
  workouts: Workout[],
  now = Date.now()
): WeeklyTrainingLoad {
  const prMuscles = collectRecentPrMuscleGroups(workouts, now)
  if (!prMuscles.length) return load

  const adjusted = applyPrRotationToSuggestedType(
    load.suggestedWorkoutType,
    prMuscles,
    load.lastWorkoutType
  )
  const note = buildWeeklyPlanPrRotationNote(prMuscles, adjusted)

  return {
    ...load,
    suggestedWorkoutType: adjusted,
    recentPrMuscleGroups: prMuscles,
    prRotationNote: note ?? undefined,
  }
}

/** Fusiona historial Fuel semanal con entreno reciente (demo / Perfil). */
export function mergeWorkoutsForWeeklyPlan(
  fuelWeekWorkouts: Workout[],
  recentWorkouts: Workout[]
): Workout[] {
  if (!recentWorkouts.length) return fuelWeekWorkouts
  const byId = new Map<string, Workout>()
  for (const w of fuelWeekWorkouts) byId.set(w.id, w)
  for (const w of recentWorkouts) byId.set(w.id, w)
  return [...byId.values()].sort(
    (a, b) => (b.endedAt || b.startedAt) - (a.endedAt || a.startedAt)
  )
}