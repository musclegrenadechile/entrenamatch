import type { Workout, WorkoutType } from '../../types'
import { toLocalDateStr } from '../../utils/fuelCalculator'
import { inferDominantMuscle } from '../fuelBalance/inferDominantMuscle'
import type { WeeklyTrainingLoad } from './types'

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

function workoutDate(w: Workout): string {
  return toLocalDateStr(new Date(w.endedAt || w.startedAt))
}

function daysBetween(dateStr: string, todayStr: string): number {
  const a = new Date(`${dateStr}T12:00:00`).getTime()
  const b = new Date(`${todayStr}T12:00:00`).getTime()
  return Math.max(0, Math.round((b - a) / 86_400_000))
}

export function inferWeeklyTrainingLoad(
  workouts: Workout[],
  now = Date.now()
): WeeklyTrainingLoad {
  const todayStr = toLocalDateStr(new Date(now))
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 6)
  const weekStartStr = toLocalDateStr(weekStart)

  const weekWorkouts = workouts
    .filter((w) => {
      const d = workoutDate(w)
      return d >= weekStartStr && d <= todayStr
    })
    .sort((a, b) => (b.endedAt || b.startedAt) - (a.endedAt || a.startedAt))

  const activeDays = new Set(weekWorkouts.map(workoutDate)).size
  const last = weekWorkouts[0]
  const lastDate = last ? workoutDate(last) : ''
  const daysSinceLastSession = last ? daysBetween(lastDate, todayStr) : 99

  const fatiguedMuscleGroups: string[] = []
  if (last) {
    const muscle = inferDominantMuscle(last.exercises, last.type)
    if (muscle) fatiguedMuscleGroups.push(muscle)
    if (last.type === 'legs') fatiguedMuscleGroups.push('Piernas')
    if (last.type === 'push') fatiguedMuscleGroups.push('Pecho')
    if (last.type === 'pull') fatiguedMuscleGroups.push('Espalda')
  }

  const lastType = last?.type
  let suggestedWorkoutType: WorkoutType = 'full'

  if (daysSinceLastSession >= 4 || weekWorkouts.length === 0) {
    suggestedWorkoutType = 'full'
  } else if (lastType) {
    const options = ROTATION_AFTER[lastType] || ['full']
    suggestedWorkoutType = options[0]
  }

  for (const muscle of fatiguedMuscleGroups) {
    const blocked = MUSCLE_TO_TYPE[muscle]
    if (blocked && suggestedWorkoutType === blocked) {
      const alt = (ROTATION_AFTER[blocked] || ['full']).find((t) => t !== blocked)
      if (alt) suggestedWorkoutType = alt
    }
  }

  return {
    sessionsCount: weekWorkouts.length,
    activeDays,
    daysSinceLastSession,
    lastWorkoutType: lastType,
    fatiguedMuscleGroups: [...new Set(fatiguedMuscleGroups)],
    suggestedWorkoutType,
  }
}
