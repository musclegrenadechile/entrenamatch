import type { Workout } from '../types'

/** Volúmenes (kg) para mini sparkline en historial — más antiguo a la izquierda. */
export function buildWorkoutHistorySparkline(
  workouts: Workout[],
  fromIndex: number,
  windowSize = 5
): number[] {
  const slice = workouts.slice(fromIndex, fromIndex + windowSize)
  if (slice.length < 2) return []
  return slice
    .map((w) => Math.max(0, w.stats?.totalVolumeKg ?? 0))
    .reverse()
}