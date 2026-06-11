import { describe, expect, it } from 'vitest'
import {
  heartRateStats,
  sessionIsoRange,
  workoutOverlapsSession,
} from './wearableSessionMetrics'

describe('wearableSessionMetrics', () => {
  it('builds ISO range from session timestamps', () => {
    const start = new Date('2026-06-10T10:00:00').getTime()
    const end = new Date('2026-06-10T11:00:00').getTime()
    const range = sessionIsoRange(start, end)
    expect(range.startDate).toContain('2026-06-10')
    expect(range.endDate).toContain('2026-06-10')
  })

  it('computes HR avg and max', () => {
    expect(heartRateStats([{ value: 120 }, { value: 140 }])).toEqual({ avg: 130, max: 140 })
    expect(heartRateStats([])).toEqual({ avg: 0, max: 0 })
  })

  it('detects workout overlap with session', () => {
    const start = Date.UTC(2026, 5, 10, 10, 0, 0)
    const end = Date.UTC(2026, 5, 10, 11, 0, 0)
    expect(
      workoutOverlapsSession(
        [{ startDate: '2026-06-10T10:30:00.000Z', endDate: '2026-06-10T10:45:00.000Z' }],
        start,
        end
      )
    ).toBe(true)
    expect(workoutOverlapsSession([], start, end)).toBe(false)
  })
})
