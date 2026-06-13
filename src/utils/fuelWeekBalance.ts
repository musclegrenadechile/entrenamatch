/** Fase 94 — weekly burn vs consumo vs target for Fuel chart. */

import type { Workout } from '../types'
import type { FuelWeekMacroDay } from '../services/fuel'
import { estimateWorkoutBurn } from '../domain/fuelBalance/estimateWorkoutBurn'
import { toLocalDateStr } from './fuelCalculator'

export type FuelWeekBalanceDay = {
  label: string
  date: string
  isToday: boolean
  consumedKcal: number
  /** Quema estimada por entrenos registrados. */
  burnKcal: number
  /** Quema importada del wearable (Health Connect / Apple Health). */
  healthBurnKcal: number
  targetKcal: number
  logged: boolean
}

function workoutLocalDate(w: Workout): string {
  return toLocalDateStr(new Date(w.endedAt || w.startedAt))
}

export function buildFuelWeekBalanceDays(
  macros: FuelWeekMacroDay[],
  workouts: Workout[],
  targetKcal: number,
  weightKg: number,
  healthBurnByDate: Record<string, number> = {}
): FuelWeekBalanceDay[] {
  const burnByDate = new Map<string, number>()
  for (const w of workouts) {
    const date = workoutLocalDate(w)
    const burn = estimateWorkoutBurn(w, weightKg)
    burnByDate.set(date, (burnByDate.get(date) || 0) + burn)
  }

  return macros.map((day) => ({
    label: day.label,
    date: day.date,
    isToday: day.isToday,
    consumedKcal: Math.round(day.kcal),
    burnKcal: Math.round(burnByDate.get(day.date) || 0),
    healthBurnKcal: Math.round(healthBurnByDate[day.date] || 0),
    targetKcal: Math.round(targetKcal),
    logged: day.logged,
  }))
}
