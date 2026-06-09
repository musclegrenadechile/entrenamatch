import { describe, expect, it } from 'vitest'
import {
  buildPactReminderMessage,
  buildPostLiveFeedText,
  countLoggedSessionsInWeek,
  computeWeeklyPactProgress,
  getPactReminderGaps,
} from '../services/weeklyPact'
import type { Workout } from '../types'

describe('countLoggedSessionsInWeek', () => {
  it('counts unique days in current week', () => {
    const ref = new Date('2026-06-07T12:00:00')
    const workouts: Workout[] = [
      {
        id: '1',
        userId: 'u',
        title: 'A',
        type: 'push',
        startedAt: new Date('2026-06-07T10:00:00').getTime(),
        endedAt: new Date('2026-06-07T11:00:00').getTime(),
        exercises: [],
        stats: { totalSets: 1, totalVolumeKg: 100, durationMin: 45, exerciseCount: 1 },
        source: 'manual',
      },
      {
        id: '2',
        userId: 'u',
        title: 'B',
        type: 'pull',
        startedAt: new Date('2026-06-05T10:00:00').getTime(),
        endedAt: new Date('2026-06-05T11:00:00').getTime(),
        exercises: [],
        stats: { totalSets: 1, totalVolumeKg: 100, durationMin: 45, exerciseCount: 1 },
        source: 'manual',
      },
    ]
    expect(countLoggedSessionsInWeek(workouts, ref)).toBe(2)
  })
})

describe('computeWeeklyPactProgress', () => {
  it('includes logged sessions in completion', () => {
    const ref = new Date('2026-06-07T12:00:00')
    const pact = {
      weekKey: '2026-06-01',
      liveDaysTarget: 3,
      syncSessionsTarget: 1,
      loggedSessionsTarget: 3,
      pledgedAt: Date.now(),
    }
    const progress = computeWeeklyPactProgress(
      pact,
      3,
      { weekKey: '2026-06-01', liveMinutes: 120, syncMinutes: 20, liveDays: 3, updatedAt: Date.now() },
      3,
      ref
    )
    expect(progress.isComplete).toBe(true)
    expect(progress.loggedPct).toBe(100)
  })
})

describe('getPactReminderGaps', () => {
  it('returns logs gap when sessions missing', () => {
    const ref = new Date('2026-06-07T12:00:00')
    const progress = computeWeeklyPactProgress(
      {
        weekKey: '2026-06-01',
        liveDaysTarget: 3,
        syncSessionsTarget: 1,
        loggedSessionsTarget: 3,
        pledgedAt: Date.now(),
      },
      3,
      { weekKey: '2026-06-01', liveMinutes: 120, syncMinutes: 20, liveDays: 3, updatedAt: Date.now() },
      1,
      ref
    )
    const gaps = getPactReminderGaps(progress)
    expect(gaps.some((g) => g.kind === 'logs' && g.remaining === 2)).toBe(true)
    expect(buildPactReminderMessage(progress)).toContain('2 logs')
  })
})

describe('buildPostLiveFeedText', () => {
  it('includes gym name and minutes', () => {
    expect(buildPostLiveFeedText(52, 'Smart Fit Viña')).toContain('Smart Fit Viña')
    expect(buildPostLiveFeedText(52, 'Smart Fit Viña')).toContain('52 min')
  })
})
