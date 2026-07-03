import type { Workout } from '../types'
import { buildWorkoutHistoryBadges } from './workoutHistoryBadges'

export type WorkoutHistorySparklinePoint = {
  volumeKg: number
  isPr: boolean
}

/** Puntos de sparkline con flag PR por sesión (oleada 396). */
export function buildWorkoutHistorySparklineData(
  workouts: Workout[],
  fromIndex: number,
  windowSize = 5
): WorkoutHistorySparklinePoint[] {
  const slice = workouts.slice(fromIndex, fromIndex + windowSize)
  if (slice.length < 2) return []
  return slice
    .map((w, i) => {
      const absoluteIndex = fromIndex + i
      const isPr = buildWorkoutHistoryBadges(w, workouts.slice(absoluteIndex + 1)).some(
        (b) => b.kind === 'pr'
      )
      return {
        volumeKg: Math.max(0, w.stats?.totalVolumeKg ?? 0),
        isPr,
      }
    })
    .reverse()
}

/** Volúmenes (kg) para mini sparkline en historial — más antiguo a la izquierda. */
export function buildWorkoutHistorySparkline(
  workouts: Workout[],
  fromIndex: number,
  windowSize = 5
): number[] {
  return buildWorkoutHistorySparklineData(workouts, fromIndex, windowSize).map((p) => p.volumeKg)
}

export function countWorkoutHistorySparklinePrPoints(
  points: readonly WorkoutHistorySparklinePoint[]
): number {
  return points.filter((p) => p.isPr).length
}

/** Etiqueta accesible para sparkline de historial (oleada 397). */
export function buildWorkoutHistorySparklineAriaLabel(
  points: readonly WorkoutHistorySparklinePoint[]
): string {
  if (points.length < 2) return ''
  const prCount = countWorkoutHistorySparklinePrPoints(points)
  const latest = Math.round(points[points.length - 1]?.volumeKg ?? 0)
  if (prCount > 0) {
    const sessions = prCount === 1 ? 'sesión' : 'sesiones'
    return `Tendencia de volumen; ${prCount} ${sessions} con PR; último ${latest} kg`
  }
  return `Tendencia de volumen; último ${latest} kg`
}