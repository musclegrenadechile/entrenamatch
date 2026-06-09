import { describe, expect, it } from 'vitest'
import { computeWeeklyEnergySummary } from './computeWeeklyEnergySummary'
import { inferWeeklyTrainingLoad } from './inferWeeklyTrainingLoad'
import { recommendNextSessions } from './recommendNextSessions'
import type { Workout } from '../../types'

function macroDay(kcal: number, logged = true) {
  return {
    label: 'L',
    date: '2026-06-09',
    isToday: true,
    logged,
    kcal,
    proteinG: 100,
    carbsG: 200,
    fatG: 60,
  }
}

function workout(type: Workout['type'], daysAgo: number): Workout {
  const d = Date.now() - daysAgo * 86_400_000
  return {
    id: `w-${daysAgo}`,
    userId: 'u1',
    title: 'Test',
    type,
    exercises: [{ name: 'Press banca', sets: [{ reps: 10, weightKg: 60 }] }],
    startedAt: d,
    endedAt: d + 3_600_000,
    stats: { durationMin: 50, totalSets: 12, totalVolumeKg: 5000, exerciseCount: 4 },
    source: 'manual' as const,
  }
}

describe('computeWeeklyEnergySummary', () => {
  it('computes weekly delta vs target', () => {
    const summary = computeWeeklyEnergySummary({
      weekMacros: [
        { ...macroDay(2200), date: '2026-06-03', isToday: false },
        { ...macroDay(2400), date: '2026-06-04', isToday: false },
        { ...macroDay(2100), date: '2026-06-05', isToday: false },
      ],
      weekBalanceDays: [
        { label: 'L', date: '2026-06-03', isToday: false, consumedKcal: 2200, burnKcal: 300, targetKcal: 2000, logged: true },
        { label: 'M', date: '2026-06-04', isToday: false, consumedKcal: 2400, burnKcal: 0, targetKcal: 2000, logged: true },
      ],
      dailyTargetKcal: 2000,
      ref: new Date('2026-06-09'),
    })
    expect(summary.loggedDays).toBe(3)
    expect(summary.totalConsumedKcal).toBe(6700)
    expect(summary.totalBurnKcal).toBe(300)
    expect(summary.weeklyDeltaKcal).toBeGreaterThan(0)
  })
})

describe('inferWeeklyTrainingLoad', () => {
  it('suggests rotation after legs day', () => {
    const load = inferWeeklyTrainingLoad([workout('legs', 1)], Date.now())
    expect(load.lastWorkoutType).toBe('legs')
    expect(load.suggestedWorkoutType).not.toBe('legs')
  })

  it('suggests full body after long inactivity', () => {
    const load = inferWeeklyTrainingLoad([workout('push', 5)], Date.now())
    expect(load.daysSinceLastSession).toBeGreaterThanOrEqual(4)
    expect(load.suggestedWorkoutType).toBe('full')
  })
})

describe('recommendNextSessions', () => {
  const baseEnergy = {
    weekKey: '2026-W23',
    loggedDays: 5,
    totalConsumedKcal: 15000,
    totalBurnKcal: 1200,
    totalTargetKcal: 14000,
    weeklyDeltaKcal: 2200,
    avgDailyDeltaKcal: 440,
  }

  const baseLoad = {
    sessionsCount: 3,
    activeDays: 3,
    daysSinceLastSession: 1,
    lastWorkoutType: 'push' as const,
    fatiguedMuscleGroups: ['Pecho'],
    suggestedWorkoutType: 'pull' as const,
  }

  it('recommends walk/cardio for surplus when goal is lose', () => {
    const plan = recommendNextSessions({
      profile: { goal: 'lose', weightKg: 75, level: 'Intermedio', targetKcal: 2000 },
      energy: baseEnergy,
      load: baseLoad,
    })
    expect(plan.scenario).toBe('surplus')
    expect(['walk', 'cardio']).toContain(plan.recommendation.type)
  })

  it('recommends catch_up full body after inactivity', () => {
    const plan = recommendNextSessions({
      profile: { goal: 'maintain', weightKg: 70, level: 'Principiante', targetKcal: 2200 },
      energy: { ...baseEnergy, weeklyDeltaKcal: 0, loggedDays: 4 },
      load: { ...baseLoad, sessionsCount: 0, daysSinceLastSession: 5, suggestedWorkoutType: 'full' },
    })
    expect(plan.scenario).toBe('catch_up')
    expect(plan.recommendation.workoutType).toBe('full')
  })

  it('low confidence when few fuel logs', () => {
    const plan = recommendNextSessions({
      profile: { goal: 'muscle', weightKg: 80, level: 'Avanzado', targetKcal: 2800 },
      energy: { ...baseEnergy, loggedDays: 1, weeklyDeltaKcal: -500 },
      load: baseLoad,
    })
    expect(plan.confidence).toBe('low')
    expect(plan.scenario).toBe('under_fueled')
  })
})
