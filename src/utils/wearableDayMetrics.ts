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
