import { describe, it, expect } from 'vitest'
import {
  estimateBurnFromMet,
  estimateWorkoutBurn,
  estimateLiveBurn,
  liveMinutesFromSince,
} from './estimateWorkoutBurn'
import { inferDominantMuscle } from './inferDominantMuscle'
import { computeDailyEnergyBalance } from './computeDailyEnergyBalance'
import type { FuelProfile, Workout } from '../../types'

const profile: FuelProfile = {
  weightKg: 75,
  heightCm: 175,
  age: 28,
  gender: 'hombre',
  goal: 'muscle',
  activityLevel: 'active',
  tdee: 2500,
  targetKcal: 2700,
  targetProteinG: 180,
  targetCarbsG: 300,
  targetFatG: 75,
}

describe('estimateWorkoutBurn', () => {
  it('MET push 60min 75kg ≈ 450 kcal', () => {
    expect(estimateBurnFromMet(6, 75, 60)).toBe(450)
  })

  it('legs burns more than push same duration', () => {
    const push = estimateWorkoutBurn(
      { type: 'push', stats: { durationMin: 60, totalVolumeKg: 5000, totalSets: 15, exerciseCount: 5 }, exercises: [] },
      75,
      false
    )
    const legs = estimateWorkoutBurn(
      { type: 'legs', stats: { durationMin: 60, totalVolumeKg: 5000, totalSets: 15, exerciseCount: 5 }, exercises: [] },
      75,
      false
    )
    expect(legs).toBeGreaterThan(push)
  })
})

describe('inferDominantMuscle', () => {
  it('detects pecho from press banca', () => {
    expect(
      inferDominantMuscle([{ name: 'Press banca', sets: [{ reps: 10, weightKg: 60 }] }], 'push')
    ).toBe('Pecho')
  })
})

describe('computeDailyEnergyBalance', () => {
  it('raises target after workout burn', () => {
    const now = Date.now()
    const workout: Workout = {
      id: 'w1',
      userId: 'u1',
      title: 'Pecho',
      type: 'push',
      startedAt: now - 3600000,
      endedAt: now,
      exercises: [{ name: 'Press banca', sets: [{ reps: 10, weightKg: 70 }] }],
      stats: { durationMin: 52, totalVolumeKg: 7000, totalSets: 12, exerciseCount: 4 },
      source: 'manual',
    }
    const balance = computeDailyEnergyBalance({
      profile,
      fuelLogs: [],
      workouts: [workout],
    })
    expect(balance).not.toBeNull()
    expect(balance!.workoutBurnKcal).toBeGreaterThan(300)
    expect(balance!.adjustedTargetKcal).toBeGreaterThan(profile.targetKcal)
    expect(balance!.dominantMuscle).toBe('Pecho')
  })

  it('adds live burn when training without full log overlap', () => {
    const since = Date.now() - 45 * 60000
    const balance = computeDailyEnergyBalance({
      profile,
      fuelLogs: [],
      workouts: [],
      live: { trainingNow: true, trainingNowSince: since, weightKg: 75 },
    })
    expect(balance!.liveBurnKcal).toBeGreaterThan(200)
  })
})

describe('liveMinutesFromSince', () => {
  it('returns minutes when live', () => {
    const now = Date.now()
    expect(liveMinutesFromSince(true, now - 30 * 60000, now)).toBe(30)
  })
})

describe('estimateLiveBurn', () => {
  it('returns positive for 30 min session', () => {
    expect(estimateLiveBurn({ weightKg: 75, durationMin: 30 })).toBeGreaterThan(150)
  })
})
