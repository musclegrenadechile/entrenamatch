/**
 * Entreno de Hoy — weekly stats & exercise progression (oleada 2).
 */

import type { Workout } from '../types'

export interface WeekWorkoutDay {
  dateStr: string
  label: string
  volumeKg: number
  sets: number
  sessions: number
}

export interface WeekWorkoutSummary {
  totalSessions: number
  totalSets: number
  totalVolumeKg: number
  activeDays: number
  days: WeekWorkoutDay[]
}

export interface ExerciseProgressEntry {
  name: string
  bestWeightKg: number
  bestReps: number
  sessionCount: number
  points: Array<{ t: number; weightKg: number; reps: number }>
  trend: 'up' | 'flat' | 'down'
}

function localDateStr(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function dayLabel(dateStr: string, now = Date.now()): string {
  const today = localDateStr(now)
  if (dateStr === today) return 'Hoy'
  const yesterday = localDateStr(now - 86_400_000)
  if (dateStr === yesterday) return 'Ayer'
  const [, , d] = dateStr.split('-')
  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const wd = weekdays[new Date(dateStr + 'T12:00:00').getDay()]
  return `${wd} ${Number(d)}`
}

/** Last 7 calendar days aggregated from workout history. */
export function buildWeekWorkoutSummary(
  workouts: Workout[],
  now = Date.now()
): WeekWorkoutSummary {
  const dayKeys: string[] = []
  for (let i = 6; i >= 0; i--) {
    dayKeys.push(localDateStr(now - i * 86_400_000))
  }

  const byDay = new Map<string, WeekWorkoutDay>()
  for (const key of dayKeys) {
    byDay.set(key, { dateStr: key, label: dayLabel(key, now), volumeKg: 0, sets: 0, sessions: 0 })
  }

  let totalSessions = 0
  let totalSets = 0
  let totalVolumeKg = 0

  for (const w of workouts) {
    const key = localDateStr(w.endedAt || w.startedAt)
    if (!byDay.has(key)) continue
    const row = byDay.get(key)!
    row.sessions += 1
    row.sets += w.stats?.totalSets ?? 0
    row.volumeKg += w.stats?.totalVolumeKg ?? 0
    totalSessions += 1
    totalSets += w.stats?.totalSets ?? 0
    totalVolumeKg += w.stats?.totalVolumeKg ?? 0
  }

  const days = dayKeys.map((k) => byDay.get(k)!)
  const activeDays = days.filter((d) => d.sessions > 0).length

  return { totalSessions, totalSets, totalVolumeKg, activeDays, days }
}

/** Top exercises by frequency with best set + trend (last 2 sessions with that exercise). */
export function getTopExerciseProgress(
  workouts: Workout[],
  limit = 3
): ExerciseProgressEntry[] {
  const byName = new Map<
    string,
    { displayName: string; points: Array<{ t: number; weightKg: number; reps: number }> }
  >()

  const sorted = [...workouts].sort(
    (a, b) => (a.endedAt || a.startedAt) - (b.endedAt || b.startedAt)
  )

  for (const w of sorted) {
    const t = w.endedAt || w.startedAt
    for (const ex of w.exercises || []) {
      const key = ex.name.trim().toLowerCase()
      if (!key) continue
      let bestW = 0
      let bestR = 0
      for (const set of ex.sets || []) {
        const wkg = set.weightKg || 0
        const reps = set.reps || 0
        if (wkg > bestW || (wkg === bestW && reps > bestR)) {
          bestW = wkg
          bestR = reps
        }
      }
      if (bestW <= 0 && bestR <= 0) continue
      const prev = byName.get(key) || { displayName: ex.name, points: [] }
      prev.points.push({ t, weightKg: bestW, reps: bestR })
      byName.set(key, prev)
    }
  }

  const entries: ExerciseProgressEntry[] = []
  for (const [, v] of byName) {
    if (!v.points.length) continue
    const last = v.points[v.points.length - 1]
    const prev = v.points.length >= 2 ? v.points[v.points.length - 2] : null
    let trend: ExerciseProgressEntry['trend'] = 'flat'
    if (prev) {
      if (last.weightKg > prev.weightKg) trend = 'up'
      else if (last.weightKg < prev.weightKg) trend = 'down'
      else if (last.reps > prev.reps) trend = 'up'
      else if (last.reps < prev.reps) trend = 'down'
    }
    entries.push({
      name: v.displayName,
      bestWeightKg: Math.max(...v.points.map((p) => p.weightKg)),
      bestReps: last.reps,
      sessionCount: v.points.length,
      points: v.points.slice(-6),
      trend,
    })
  }

  return entries
    .sort((a, b) => b.sessionCount - a.sessionCount || b.bestWeightKg - a.bestWeightKg)
    .slice(0, limit)
}

export function formatWeekVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k kg`
  return `${Math.round(kg)} kg`
}
