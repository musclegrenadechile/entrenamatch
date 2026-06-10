import { describe, expect, it } from 'vitest'
import { getYesterdayWorkout, hasWorkoutToday, resolveHomeHero } from './homeHero'
import type { Workout } from '../types'
import { computeWeeklyPactProgress } from '../services/weeklyPact'

const baseWorkout = (endedAt: number, title = 'Push'): Workout => ({
  id: 'w1',
  userId: 'u',
  title,
  type: 'push',
  startedAt: endedAt - 3_600_000,
  endedAt,
  exercises: [{ name: 'Press', sets: [{ reps: 10, weightKg: 40 }] }],
  stats: { totalSets: 3, totalVolumeKg: 400, durationMin: 45, exerciseCount: 1 },
  source: 'manual',
})

describe('hasWorkoutToday', () => {
  it('detects workout on same calendar day', () => {
    const now = new Date('2026-06-07T18:00:00').getTime()
    expect(hasWorkoutToday([baseWorkout(now)], now)).toBe(true)
  })
})

describe('resolveHomeHero', () => {
  const ref = new Date('2026-06-07T12:00:00')
  const progress = computeWeeklyPactProgress(
    {
      weekKey: '2026-06-01',
      liveDaysTarget: 3,
      syncSessionsTarget: 1,
      loggedSessionsTarget: 3,
      pledgedAt: Date.now(),
    },
    1,
    undefined,
    0,
    ref
  )

  it('suggests repeat when yesterday has workout and not today', () => {
    const yesterday = new Date('2026-06-06T10:00:00').getTime()
    const hero = resolveHomeHero({
      isLive: false,
      weeklyPactProgress: progress,
      entrenoRecentWorkouts: [baseWorkout(yesterday, 'Pull ayer')],
      weekTrainedCount: 1,
      now: ref.getTime(),
    })
    expect(hero.action).toBe('repeat')
    expect(hero.title).toContain('Vuelve')
    expect(hero.cta).toContain('Elegir')
  })

  it('suggests live when live is active', () => {
    const hero = resolveHomeHero({
      isLive: true,
      weeklyPactProgress: progress,
      entrenoRecentWorkouts: [],
      weekTrainedCount: 0,
      now: ref.getTime(),
    })
    expect(hero.action).toBe('log')
  })
})

describe('getYesterdayWorkout', () => {
  it('returns workout from previous day', () => {
    const now = new Date('2026-06-07T12:00:00').getTime()
    const y = new Date('2026-06-06T10:00:00').getTime()
    const w = baseWorkout(y)
    expect(getYesterdayWorkout([w], now)?.title).toBe('Push')
  })
})
