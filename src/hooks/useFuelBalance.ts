import { useMemo } from 'react'
import type { FuelLogEntry, FuelProfile, Workout } from '../types'
import {
  computeDailyEnergyBalance,
  type DailyEnergyBalance,
} from '../domain/fuelBalance'

export interface UseFuelBalanceInput {
  profile: FuelProfile | null
  fuelLogs: FuelLogEntry[]
  workouts: Workout[]
  trainingNow?: boolean
  trainingNowSince?: number | null
  dateStr?: string
}

/** Phase 81 — Fuel balance hook (pure compute, memoized). */
export function useFuelBalance(input: UseFuelBalanceInput): DailyEnergyBalance | null {
  const {
    profile,
    fuelLogs,
    workouts,
    trainingNow,
    trainingNowSince,
    dateStr,
  } = input

  return useMemo(
    () =>
      computeDailyEnergyBalance({
        profile,
        fuelLogs,
        workouts,
        live: profile
          ? {
              trainingNow: !!trainingNow,
              trainingNowSince,
              weightKg: profile.weightKg,
            }
          : undefined,
        dateStr,
      }),
    [
      profile,
      fuelLogs,
      workouts,
      trainingNow,
      trainingNowSince,
      dateStr,
    ]
  )
}
