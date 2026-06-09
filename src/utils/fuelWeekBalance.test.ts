import { describe, expect, it } from 'vitest'
import { buildFuelWeekBalanceDays } from './fuelWeekBalance'
import { toLocalDateStr } from './fuelCalculator'
import type { FuelWeekMacroDay } from '../services/fuel'
import type { Workout } from '../types'

describe('fuelWeekBalance (fase 94)', () => {
  it('merges macros with workout burn per day', () => {
    const today = toLocalDateStr()
    const macros: FuelWeekMacroDay[] = [
      {
        label: 'Hoy',
        date: today,
        isToday: true,
        logged: true,
        kcal: 1800,
        proteinG: 120,
        carbsG: 200,
        fatG: 60,
      },
    ]
    const now = Date.now()
    const workouts: Workout[] = [
      {
        id: 'w1',
        userId: 'u',
        title: 'Push',
        type: 'push',
        startedAt: now - 3600000,
        endedAt: now,
        exercises: [],
        stats: { totalSets: 12, totalVolumeKg: 4000, durationMin: 60, exerciseCount: 4 },
        source: 'manual',
      },
    ]
    const days = buildFuelWeekBalanceDays(macros, workouts, 2400, 75)
    expect(days[0].consumedKcal).toBe(1800)
    expect(days[0].burnKcal).toBeGreaterThan(0)
    expect(days[0].targetKcal).toBe(2400)
  })
})
