import type { Workout, WorkoutType } from '../../types'

/** MET values (Compendium-style, conservative for resistance training). */
export const WORKOUT_TYPE_MET: Record<WorkoutType, number> = {
  push: 6.0,
  pull: 6.0,
  legs: 7.0,
  full: 6.5,
  cardio: 8.0,
  other: 5.0,
}

export const LIVE_SESSION_MET = 5.5

/** kcal = MET × weightKg × durationHours */
export function estimateBurnFromMet(
  met: number,
  weightKg: number,
  durationMin: number
): number {
  if (weightKg <= 0 || durationMin <= 0) return 0
  const hours = durationMin / 60
  return Math.round(met * weightKg * hours)
}

export function estimateWorkoutBurn(
  workout: Pick<Workout, 'type' | 'stats' | 'exercises'>,
  weightKg: number,
  volumeBoost = true
): number {
  const durationMin = workout.stats?.durationMin || 1
  let met = WORKOUT_TYPE_MET[workout.type] ?? WORKOUT_TYPE_MET.other

  if (volumeBoost && workout.stats?.totalVolumeKg) {
    const vol = workout.stats.totalVolumeKg
    if (vol > 12000) met += 0.8
    else if (vol > 8000) met += 0.5
    else if (vol > 5000) met += 0.25
  }

  return estimateBurnFromMet(met, weightKg, durationMin)
}

export function estimateLiveBurn(input: {
  weightKg: number
  durationMin: number
}): number {
  return estimateBurnFromMet(LIVE_SESSION_MET, input.weightKg, input.durationMin)
}

export function liveMinutesFromSince(
  trainingNow: boolean,
  trainingNowSince?: number | null,
  now = Date.now()
): number {
  if (!trainingNow || !trainingNowSince) return 0
  const since = Number(trainingNowSince)
  if (!Number.isFinite(since) || since <= 0) return 0
  return Math.max(1, Math.floor((now - since) / 60000))
}
