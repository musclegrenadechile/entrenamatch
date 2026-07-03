import type { Workout, WorkoutExercise, WorkoutType } from '../types'
import { computeWorkoutStats } from '../services/workouts'

export function buildDemoWorkoutFromSave(
  userId: string,
  payload: {
    title: string
    type: WorkoutType
    exercises: WorkoutExercise[]
    durationMin: number
  }
): Workout {
  const now = Date.now()
  const stats = computeWorkoutStats(payload.exercises, payload.durationMin)
  return {
    id: `demo-w-${now}`,
    userId,
    title: payload.title,
    type: payload.type,
    startedAt: now - payload.durationMin * 60_000,
    endedAt: now,
    exercises: payload.exercises,
    stats,
    source: 'manual',
  }
}

/** Historial demo para E2E historial Perfil (oleada 400): 2 sesiones, la más reciente con PR. */
export function buildE2EDemoWorkoutHistory(userId: string): Workout[] {
  const now = Date.now()
  const day = 86_400_000
  const older: Workout = {
    id: 'e2e-w-1',
    userId,
    title: 'Push base',
    type: 'push',
    startedAt: now - 2 * day,
    endedAt: now - 2 * day + 45 * 60_000,
    exercises: [{ name: 'Press banca', sets: [{ reps: 10, weightKg: 50 }] }],
    stats: {
      totalSets: 1,
      totalVolumeKg: 500,
      durationMin: 45,
      exerciseCount: 1,
    },
    source: 'manual',
  }
  const newer: Workout = {
    id: 'e2e-w-2',
    userId,
    title: 'E2E Entreno PR',
    type: 'push',
    startedAt: now - 60_000,
    endedAt: now,
    exercises: [{ name: 'Press banca', sets: [{ reps: 10, weightKg: 60 }] }],
    stats: {
      totalSets: 1,
      totalVolumeKg: 600,
      durationMin: 45,
      exerciseCount: 1,
    },
    source: 'manual',
  }
  return [newer, older]
}