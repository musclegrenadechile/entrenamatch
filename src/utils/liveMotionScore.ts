/**
 * Live motion score — fase B (anti-reposo honor system).
 * Pure functions for accelerometer variance → 0–100 score and idle detection.
 */

export const LIVE_MOTION_SAMPLE_INTERVAL_MS = 3 * 60 * 1000
export const LIVE_MOTION_IDLE_STALE_MS = 15 * 60 * 1000
export const LIVE_MOTION_IDLE_SCORE_THRESHOLD = 12
export const LIVE_MOTION_WINDOW_MS = 10_000
export const LIVE_MOTION_WINDOW_INTERVAL_MS = 200

export type LiveActivityState = 'active' | 'idle' | 'unknown'

export interface AccelSample {
  x: number
  y: number
  z: number
  t: number
}

/** Magnitude variance → 0–100 motion score (higher = more movement). */
export function computeMotionVarianceScore(samples: AccelSample[]): number {
  if (!samples?.length || samples.length < 3) return 0
  const mags = samples.map((s) => Math.hypot(s.x, s.y, s.z))
  const mean = mags.reduce((a, b) => a + b, 0) / mags.length
  const variance = mags.reduce((acc, m) => acc + (m - mean) ** 2, 0) / mags.length
  // Rest ~0.0001–0.02 var; walking/lifting often 0.05–2+
  const scaled = Math.min(100, Math.round(Math.sqrt(variance) * 420))
  return scaled
}

/** GPS drift fallback when accelerometer unavailable (weak signal). */
export function computeGpsDriftScore(
  points: Array<{ lat: number; lng: number; t: number }>
): number {
  if (points.length < 2) return 0
  let totalM = 0
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const dLat = (b.lat - a.lat) * 111_320
    const dLng = (b.lng - a.lng) * 111_320 * Math.cos((a.lat * Math.PI) / 180)
    totalM += Math.hypot(dLat, dLng)
  }
  const spanMin = Math.max(1, (points[points.length - 1].t - points[0].t) / 60_000)
  const mPerMin = totalM / spanMin
  if (mPerMin < 3) return Math.round(mPerMin * 2)
  return Math.min(100, Math.round(mPerMin * 4))
}

export function deriveLiveActivityState(
  score: number | undefined,
  lastAt: number | undefined,
  now = Date.now()
): LiveActivityState {
  if (!lastAt) return 'unknown'
  const stale = now - lastAt > LIVE_MOTION_IDLE_STALE_MS
  const low = (score ?? 0) < LIVE_MOTION_IDLE_SCORE_THRESHOLD
  if (stale && low) return 'idle'
  if (!stale && low) return 'idle'
  if ((score ?? 0) >= LIVE_MOTION_IDLE_SCORE_THRESHOLD) return 'active'
  return 'unknown'
}

/** Whether map should show an attenuated / idle pin for this user. */
export function deriveLiveMotionIdle(
  score: number | undefined,
  lastAt: number | undefined,
  now = Date.now()
): boolean {
  return deriveLiveActivityState(score, lastAt, now) === 'idle'
}

export function mergeMotionSample(
  prevScore: number | undefined,
  newScore: number,
  now = Date.now()
): { score: number; lastAt: number; idle: boolean; state: LiveActivityState } {
  const blended =
    prevScore != null && Number.isFinite(prevScore)
      ? Math.round(prevScore * 0.35 + newScore * 0.65)
      : newScore
  const state = deriveLiveActivityState(blended, now, now)
  return {
    score: blended,
    lastAt: now,
    idle: state === 'idle',
    state,
  }
}
