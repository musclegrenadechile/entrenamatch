import { useEffect, useMemo, useState } from 'react'
import type { Firestore } from 'firebase/firestore'
import type { CurrentUser, FuelLogEntry, FuelProfile, Workout } from '../types'
import type { FuelWeekMacroDay } from '../services/fuel'
import { loadDailyEnergyCache } from '../services/dailyEnergy'
import { buildFuelWeekBalanceDays } from '../utils/fuelWeekBalance'
import { useFuelBalance } from './useFuelBalance'

export interface UseFuelBalancePipelineArgs {
  isDemoMode: boolean
  db: Firestore | null
  effectiveUserId: string
  fuelProfile: FuelProfile | null
  fuelTodayLogs: FuelLogEntry[]
  fuelTodayWorkouts: Workout[]
  fuelWeekMacros: FuelWeekMacroDay[]
  fuelWeekWorkouts: Workout[]
  currentUser: CurrentUser | null
  healthBurnBonus: number
}

/** Fase 342/344 — daily + weekly fuel balance with wearable burn in chart. */
export function useFuelBalancePipeline({
  isDemoMode,
  db,
  effectiveUserId,
  fuelProfile,
  fuelTodayLogs,
  fuelTodayWorkouts,
  fuelWeekMacros,
  fuelWeekWorkouts,
  currentUser,
  healthBurnBonus,
}: UseFuelBalancePipelineArgs) {
  const [weekHealthBurnByDate, setWeekHealthBurnByDate] = useState<Record<string, number>>({})

  const fuelEnergyBalance = useFuelBalance({
    profile: fuelProfile,
    fuelLogs: fuelTodayLogs,
    workouts: fuelTodayWorkouts,
    trainingNow: currentUser?.trainingNow,
    trainingNowSince: currentUser?.trainingNowSince,
    healthBurnKcal: healthBurnBonus,
  })

  const weekDatesKey = fuelWeekMacros.map((d) => d.date).join(',')

  useEffect(() => {
    if (isDemoMode || !db || !effectiveUserId || !fuelWeekMacros.length) {
      setWeekHealthBurnByDate({})
      return
    }
    let cancelled = false
    void Promise.all(
      fuelWeekMacros.map((day) => loadDailyEnergyCache(db, effectiveUserId, day.date))
    )
      .then((docs) => {
        if (cancelled) return
        const next: Record<string, number> = {}
        docs.forEach((doc, i) => {
          const kcal = doc?.healthBurnKcal
          if (kcal && kcal > 0) next[fuelWeekMacros[i].date] = kcal
        })
        setWeekHealthBurnByDate(next)
      })
      .catch(() => {
        if (!cancelled) setWeekHealthBurnByDate({})
      })
    return () => {
      cancelled = true
    }
  }, [isDemoMode, db, effectiveUserId, weekDatesKey, fuelWeekMacros])

  const fuelWeekBalanceDays = useMemo(() => {
    if (!fuelProfile || !fuelWeekMacros.length) return []
    const target = fuelEnergyBalance?.adjustedTargetKcal ?? fuelProfile.targetKcal
    return buildFuelWeekBalanceDays(
      fuelWeekMacros,
      fuelWeekWorkouts,
      target,
      fuelProfile.weightKg,
      weekHealthBurnByDate
    )
  }, [
    fuelProfile,
    fuelWeekMacros,
    fuelWeekWorkouts,
    fuelEnergyBalance?.adjustedTargetKcal,
    weekHealthBurnByDate,
  ])

  return { fuelEnergyBalance, fuelWeekBalanceDays }
}
