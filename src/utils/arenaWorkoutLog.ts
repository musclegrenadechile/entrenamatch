import type { WorkoutExercise, WorkoutSet } from '../types'
import { formatSetDisplay } from './workoutSetFields'

export interface SyncWorkoutLogState {
  activeExercise: string
  pendingReps: number
  pendingWeightKg: number
  exercises: WorkoutExercise[]
  prs: Array<{ exercise: string; weightKg: number; reps: number; at: number }>
}

export function createEmptySyncWorkoutLog(
  activeExercise = 'Press banca'
): SyncWorkoutLogState {
  return {
    activeExercise,
    pendingReps: 10,
    pendingWeightKg: 0,
    exercises: [],
    prs: [],
  }
}

export function appendSetToLog(
  log: SyncWorkoutLogState,
  exerciseName: string,
  set: WorkoutSet
): SyncWorkoutLogState {
  const name = exerciseName.trim()
  if (!name) return log
  const exercises = [...log.exercises]
  const idx = exercises.findIndex((e) => e.name === name)
  if (idx >= 0) {
    exercises[idx] = { ...exercises[idx], sets: [...exercises[idx].sets, set] }
  } else {
    exercises.push({ name, sets: [set] })
  }
  return { ...log, exercises }
}

export function countLoggedSets(log: SyncWorkoutLogState): number {
  return log.exercises.reduce((n, ex) => n + ex.sets.length, 0)
}

export function syncWorkoutHasData(log: SyncWorkoutLogState): boolean {
  return countLoggedSets(log) > 0
}

export function formatSetLabel(
  exercise: string,
  reps: number,
  weightKg: number,
  set?: WorkoutSet
): string {
  if (set) {
    return `${exercise} ${formatSetDisplay(exercise, set)}`
  }
  const w = weightKg > 0 ? ` · ${weightKg}kg` : ''
  return `${exercise} ${reps} reps${w}`
}

/** Payload written to syncSessions.participantState.{uid} */
export function toParticipantSyncPayload(log: SyncWorkoutLogState) {
  return {
    activeExercise: log.activeExercise,
    pendingReps: log.pendingReps,
    pendingWeightKg: log.pendingWeightKg,
    setCount: countLoggedSets(log),
    exercises: log.exercises,
    updatedAt: Date.now(),
  }
}
