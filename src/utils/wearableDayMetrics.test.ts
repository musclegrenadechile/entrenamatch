import { describe, expect, it } from 'vitest'
import {
  isWearableAuthorizationGranted,
  localDayIsoRange,
  sumAggregatedKcal,
  sumExerciseMinutes,
} from './wearableDayMetrics'

describe('wearableDayMetrics', () => {
  it('builds local day ISO range', () => {
    const { startDate, endDate } = localDayIsoRange('2026-06-10')
    const start = new Date(startDate)
    const end = new Date(endDate)
    expect(end.getTime()).toBeGreaterThan(start.getTime())
    expect(end.getTime() - start.getTime()).toBeGreaterThan(20 * 60 * 60 * 1000)
  })

  it('sums kcal samples', () => {
    expect(sumAggregatedKcal([{ value: 120 }, { value: 80.4 }])).toBe(200)
    expect(sumAggregatedKcal([])).toBe(0)
  })

  it('sums exercise minutes', () => {
    expect(sumExerciseMinutes([{ value: 22 }, { value: 18 }])).toBe(40)
  })

  it('detects granted wearable scopes', () => {
    expect(isWearableAuthorizationGranted(['calories', 'heartRate'])).toBe(true)
    expect(isWearableAuthorizationGranted(['heartRate'])).toBe(false)
  })
})
