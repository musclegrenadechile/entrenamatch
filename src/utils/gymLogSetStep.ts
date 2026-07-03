export const GYM_LOG_REPS_STEP = 1
export const GYM_LOG_WEIGHT_STEP = 2.5
export const GYM_LOG_MINUTES_STEP = 5
export const GYM_LOG_INTENSITY_STEP = 1

export function stepGymLogValue(
  current: number,
  delta: number,
  opts: { min: number; max: number; integer?: boolean }
): number {
  let next = current + delta
  if (opts.integer) {
    next = Math.round(next)
  } else {
    next = Math.round(next * 10) / 10
  }
  return Math.min(opts.max, Math.max(opts.min, next))
}