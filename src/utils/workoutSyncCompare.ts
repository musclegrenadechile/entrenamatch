/**
 * Entreno de Hoy — sync partner workout comparison (oleada 3).
 */

import type { ProfilePost, WorkoutExercise } from '../types'
import { computeWorkoutStats } from '../services/workouts'

export interface WorkoutLogSideStats {
  sets: number
  volumeKg: number
  exercises: number
}

export interface SyncWorkoutCompare {
  self: WorkoutLogSideStats
  partner: WorkoutLogSideStats
  winner: 'self' | 'partner' | 'tie'
  headline: string
  subline: string
}

export function statsFromExercises(
  exercises: WorkoutExercise[] | undefined | null,
  durationMin = 45
): WorkoutLogSideStats {
  if (!exercises?.length) {
    return { sets: 0, volumeKg: 0, exercises: 0 }
  }
  const stats = computeWorkoutStats(exercises, durationMin)
  return {
    sets: stats.totalSets,
    volumeKg: stats.totalVolumeKg,
    exercises: stats.exerciseCount,
  }
}

export function compareSyncWorkoutLogs(
  selfExercises: WorkoutExercise[],
  partnerExercises: WorkoutExercise[] | undefined | null,
  durationMin = 45
): SyncWorkoutCompare | null {
  const self = statsFromExercises(selfExercises, durationMin)
  const partner = statsFromExercises(partnerExercises, durationMin)
  if (self.sets === 0 && partner.sets === 0) return null

  let winner: SyncWorkoutCompare['winner'] = 'tie'
  if (self.volumeKg > partner.volumeKg) winner = 'self'
  else if (partner.volumeKg > self.volumeKg) winner = 'partner'
  else if (self.sets > partner.sets) winner = 'self'
  else if (partner.sets > self.sets) winner = 'partner'

  const headline =
    winner === 'tie'
      ? 'Empate en volumen'
      : winner === 'self'
        ? 'Ganaste en volumen'
        : 'Tu compañero llevó más volumen'

  const subline =
    winner === 'tie'
      ? `${self.sets} sets cada uno · comparativa Entreno de Hoy`
      : `${self.sets} vs ${partner.sets} sets · ${self.volumeKg.toLocaleString('es-CL')} vs ${partner.volumeKg.toLocaleString('es-CL')} kg`

  return { self, partner, winner, headline, subline }
}

function localDateStr(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Workout posts in the last 7 calendar days (public proxy for partner activity). */
export function summarizePartnerWeekFromPosts(
  posts: ProfilePost[] | undefined | null,
  now = Date.now()
): { sessions: number; totalSets: number } {
  const dayKeys = new Set<string>()
  for (let i = 6; i >= 0; i--) {
    dayKeys.add(localDateStr(now - i * 86_400_000))
  }

  let sessions = 0
  let totalSets = 0
  const seenDays = new Set<string>()

  for (const p of posts || []) {
    if (p.postType !== 'workout' || !p.workoutPreview) continue
    const key = localDateStr(p.timestamp)
    if (!dayKeys.has(key)) continue
    sessions += 1
    totalSets += p.workoutPreview.totalSets ?? 0
    seenDays.add(key)
  }

  return { sessions, totalSets }
}
