import { isTimedCardioExercise } from '../data/exerciseLibrary'
import type { Workout, WorkoutExercise } from '../types'
import { isGymLogSetComplete } from './gymLogSetDisplay'
import { countGymLogLivePRs } from './gymLogLivePR'

export type GymLogSetsProgress = {
  total: number
  complete: number
}

function formatGymLogVolumeKg(kg: number): string {
  if (kg <= 0) return ''
  if (kg >= 1000) return `${(kg / 1000).toFixed(1).replace(/\.0$/, '')}k kg`
  return `${Math.round(kg)} kg`
}

/** Cuenta series/intervalos totales y con datos mínimos registrados. */
export function countGymLogSetsProgress(exercises: WorkoutExercise[]): GymLogSetsProgress {
  let total = 0
  let complete = 0
  for (const ex of exercises) {
    for (const set of ex.sets) {
      total++
      if (isGymLogSetComplete(ex.name, set)) complete++
    }
  }
  return { total, complete }
}

/** Porcentaje 0–100 de series completas en un ejercicio. */
export function getGymLogExerciseProgressPct(exerciseName: string, sets: WorkoutExercise['sets']): number {
  if (sets.length === 0) return 0
  const complete = sets.filter((s) => isGymLogSetComplete(exerciseName, s)).length
  return Math.round((complete / sets.length) * 100)
}

/** Etiqueta compacta «2/4 listas» o «1/2 intervalos». */
export function buildGymLogExerciseProgressLabel(exerciseName: string, sets: WorkoutExercise['sets']): string {
  const { total, complete } = countGymLogSetsProgress([{ name: exerciseName, sets }])
  if (total === 0) return ''
  const unit = isTimedCardioExercise(exerciseName)
    ? total === 1
      ? 'intervalo'
      : 'intervalos'
    : total === 1
      ? 'lista'
      : 'listas'
  return `${complete}/${total} ${unit}`
}

export type GymLogSessionChipOpts = {
  history?: Workout[]
}

/** Chip de sesión activa bajo el header del gym-log. */
export function buildGymLogSessionChip(
  exercises: WorkoutExercise[],
  opts?: GymLogSessionChipOpts
): string {
  const exerciseCount = exercises.length
  const { total, complete } = countGymLogSetsProgress(exercises)
  if (exerciseCount === 0 || total === 0) return ''

  let volumeKg = 0
  for (const ex of exercises) {
    if (isTimedCardioExercise(ex.name)) continue
    for (const set of ex.sets) {
      volumeKg += (set.reps || 0) * (set.weightKg || 0)
    }
  }

  const parts: string[] = [
    exerciseCount === 1 ? '1 ejercicio' : `${exerciseCount} ejercicios`,
    total === 1 ? '1 serie' : `${total} series`,
  ]

  const vol = formatGymLogVolumeKg(volumeKg)
  if (vol) parts.push(vol)

  if (complete < total) {
    parts.push(`${complete}/${total} listas`)
  } else if (complete === total && total > 0) {
    parts.push('listo para guardar')
  }

  const prCount = opts?.history ? countGymLogLivePRs(exercises, opts.history) : 0
  if (prCount > 0) {
    parts.push(prCount === 1 ? '🏆 1 PR' : `🏆 ${prCount} PRs`)
  }

  return parts.join(' · ')
}

/** Versión corta para footer compacto móvil (sin conteo de ejercicios). */
export function buildGymLogSessionChipCompact(
  exercises: WorkoutExercise[],
  opts?: GymLogSessionChipOpts
): string {
  const full = buildGymLogSessionChip(exercises, opts)
  return full.replace(/^\d+ ejercicios? · /, '')
}