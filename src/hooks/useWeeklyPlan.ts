import { useMemo } from 'react'
import type { FuelProfile, Workout } from '../types'
import type { FuelWeekMacroDay } from '../services/fuel'
import type { FuelWeekBalanceDay } from '../utils/fuelWeekBalance'
import type { DailyEnergyBalance } from '../domain/fuelBalance'
import {
  computeWeeklyEnergySummary,
  inferWeeklyTrainingLoad,
  recommendNextSessions,
  type WeeklyPlanResult,
} from '../domain/weeklyPlan'

export function useWeeklyPlan(input: {
  fuelProfile: FuelProfile | null | undefined
  fuelWeekMacros: FuelWeekMacroDay[]
  fuelWeekBalanceDays: FuelWeekBalanceDay[]
  fuelWeekWorkouts: Workout[]
  fuelEnergyBalance: DailyEnergyBalance | null
  userLevel?: 'Principiante' | 'Intermedio' | 'Avanzado'
}): WeeklyPlanResult | null {
  const {
    fuelProfile,
    fuelWeekMacros,
    fuelWeekBalanceDays,
    fuelWeekWorkouts,
    fuelEnergyBalance,
    userLevel = 'Intermedio',
  } = input

  return useMemo(() => {
    if (!fuelProfile) return null

    const dailyTarget =
      fuelEnergyBalance?.adjustedTargetKcal ?? fuelProfile.targetKcal

    const energy = computeWeeklyEnergySummary({
      weekMacros: fuelWeekMacros,
      weekBalanceDays: fuelWeekBalanceDays,
      dailyTargetKcal: dailyTarget,
      todayRemainingKcal: fuelEnergyBalance?.remaining.kcal,
    })

    const load = inferWeeklyTrainingLoad(fuelWeekWorkouts)

    return recommendNextSessions({
      profile: {
        goal: fuelProfile.goal,
        weightKg: fuelProfile.weightKg,
        level: userLevel,
        restrictions: fuelProfile.restrictions,
        targetKcal: fuelProfile.targetKcal,
      },
      energy,
      load,
      todayRemainingKcal: fuelEnergyBalance?.remaining.kcal,
    })
  }, [
    fuelProfile,
    fuelWeekMacros,
    fuelWeekBalanceDays,
    fuelWeekWorkouts,
    fuelEnergyBalance,
    userLevel,
  ])
}
