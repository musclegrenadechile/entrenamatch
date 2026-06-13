/** Helpers for wearable calorie / activity import (W1a). */

export function localDayIsoRange(dateStr: string): { startDate: string; endDate: string } {
  const [y, m, d] = dateStr.split('-').map(Number)
  const start = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0)
  const end = new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999)
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}

export function sumAggregatedKcal(
  samples: Array<{ value: number; unit?: string }> | null | undefined
): number {
  if (!samples?.length) return 0
  return Math.round(
    samples.reduce((sum, s) => {
      const v = Number(s.value) || 0
      if (v <= 0) return sum
      return sum + v
    }, 0)
  )
}

export function sumAggregatedCount(
  samples: Array<{ value: number; unit?: string }> | null | undefined
): number {
  if (!samples?.length) return 0
  return Math.round(
    samples.reduce((sum, s) => {
      const v = Number(s.value) || 0
      if (v <= 0) return sum
      return sum + v
    }, 0)
  )
}

export function sumExerciseMinutes(
  samples: Array<{ value: number; unit?: string }> | null | undefined
): number {
  if (!samples?.length) return 0
  return Math.round(
    samples.reduce((sum, s) => {
      const v = Number(s.value) || 0
      if (v <= 0) return sum
      return sum + v
    }, 0)
  )
}

export function isWearableAuthorizationGranted(
  readAuthorized: string[] | null | undefined,
  required: string[] = ['calories']
): boolean {
  const granted = new Set(readAuthorized || [])
  return required.some((t) => granted.has(t))
}

/** Map plugin auth payload → connected flag (calories and/or workouts enough for Fuel). */
export type HealthWorkoutSample = {
  startDate?: string
  endDate?: string
  sourceName?: string
  totalEnergyBurned?: number
  duration?: number
}

/** Sum exercise sessions from Health Connect / HealthKit queryWorkouts. */
export function summarizeHealthWorkouts(workouts: HealthWorkoutSample[]): {
  exerciseMinutes: number
  workoutCount: number
  activeCaloriesKcal: number
  sources: string[]
} {
  const sources = new Set<string>()
  let exerciseMinutes = 0
  let activeCaloriesKcal = 0

  for (const w of workouts) {
    if (w.sourceName) sources.add(w.sourceName)
    const kcal = Number(w.totalEnergyBurned) || 0
    if (kcal > 0) activeCaloriesKcal += kcal

    const start = new Date(w.startDate || 0).getTime()
    const end = new Date(w.endDate || 0).getTime()
    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      exerciseMinutes += (end - start) / 60_000
    } else if (typeof w.duration === 'number' && w.duration > 0) {
      exerciseMinutes += w.duration / 60
    }
  }

  return {
    exerciseMinutes: Math.round(exerciseMinutes),
    workoutCount: workouts.length,
    activeCaloriesKcal: Math.round(activeCaloriesKcal),
    sources: Array.from(sources).slice(0, 5),
  }
}

export function wearableConnectedFromAuth(
  auth: { readAuthorized?: string[] } | null | undefined,
  platform: 'ios' | 'android' | 'web'
): boolean {
  const granted = auth?.readAuthorized || []
  if (isWearableAuthorizationGranted(granted, ['calories'])) return true
  if (granted.includes('workouts')) return true
  // iOS HealthKit sometimes reports exerciseTime instead of calories in readAuthorized.
  if (platform === 'ios' && granted.includes('exerciseTime')) return true
  return false
}
