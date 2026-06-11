/** Session-window helpers for EntrenaSync wearable (W1b). */

export function sessionIsoRange(
  startMs: number,
  endMs: number
): { startDate: string; endDate: string } {
  const start = Math.min(startMs, endMs)
  const end = Math.max(startMs, endMs)
  return { startDate: new Date(start).toISOString(), endDate: new Date(end).toISOString() }
}

export function heartRateStats(
  samples: Array<{ value: number }> | null | undefined
): { avg: number; max: number } {
  if (!samples?.length) return { avg: 0, max: 0 }
  const values = samples.map((s) => Number(s.value) || 0).filter((v) => v > 30 && v < 250)
  if (!values.length) return { avg: 0, max: 0 }
  const sum = values.reduce((a, b) => a + b, 0)
  return { avg: Math.round(sum / values.length), max: Math.round(Math.max(...values)) }
}

export function workoutOverlapsSession(
  workouts: Array<{ startDate?: string; endDate?: string }> | null | undefined,
  startMs: number,
  endMs: number
): boolean {
  if (!workouts?.length) return false
  return workouts.some((w) => {
    if (!w.startDate) return false
    const wStart = new Date(w.startDate).getTime()
    const wEnd = w.endDate ? new Date(w.endDate).getTime() : wStart
    return wStart < endMs && wEnd > startMs
  })
}
