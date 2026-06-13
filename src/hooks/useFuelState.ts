import { useCallback, useEffect, useState } from 'react'
import type { Firestore } from 'firebase/firestore'
import type { FuelLogEntry, FuelProfile, FuelDayTotals, Workout } from '../types'
import {
  computeFuelWeekFromDates,
  emptyFuelDayTotals,
  fetchFuelLogsForDate,
  fetchFuelWeekMacros,
  fetchFuelWeekSummary,
  loadFuelProfile,
  sumFuelLogs,
  type FuelWeekDay,
  type FuelWeekMacroDay,
} from '../services/fuel'
import { fetchWorkoutsForDate, fetchRecentWorkouts } from '../services/workouts'
import { getPostWorkoutFuelTip, toLocalDateStr } from '../utils/fuelCalculator'

export interface UseFuelStateOptions {
  isDemoMode: boolean
  db: Firestore | null
  firebaseUserUid: string | null | undefined
  effectiveUserId: string
}

/** Fase 122 — Fuel profile, logs, week summary + refreshFuelData outside App.tsx */
export function useFuelState({
  isDemoMode,
  db,
  firebaseUserUid,
  effectiveUserId,
}: UseFuelStateOptions) {
  const [savingFuel, setSavingFuel] = useState(false)
  const [fuelProfile, setFuelProfile] = useState<FuelProfile | null>(null)
  const [fuelTodayLogs, setFuelTodayLogs] = useState<FuelLogEntry[]>([])
  const [fuelTodayTotals, setFuelTodayTotals] = useState<FuelDayTotals>(emptyFuelDayTotals())
  const [fuelWeekDays, setFuelWeekDays] = useState<FuelWeekDay[]>([])
  const [fuelWeekMacros, setFuelWeekMacros] = useState<FuelWeekMacroDay[]>([])
  const [editingFuelLog, setEditingFuelLog] = useState<FuelLogEntry | null>(null)
  const [deletingFuelLogId, setDeletingFuelLogId] = useState<string | null>(null)
  const [fuelPostWorkoutTip, setFuelPostWorkoutTip] = useState<string | undefined>()
  const [fuelTodayWorkouts, setFuelTodayWorkouts] = useState<Workout[]>([])
  const [fuelWeekWorkouts, setFuelWeekWorkouts] = useState<Workout[]>([])

  const refreshFuelData = useCallback(async () => {
    if (isDemoMode || !db || !firebaseUserUid) return
    try {
      const today = toLocalDateStr()
      const results = await Promise.allSettled([
        loadFuelProfile(db, effectiveUserId),
        fetchFuelLogsForDate(db, effectiveUserId),
        fetchFuelWeekSummary(db, effectiveUserId),
        fetchFuelWeekMacros(db, effectiveUserId),
        fetchWorkoutsForDate(db, effectiveUserId, today),
        fetchRecentWorkouts(db, effectiveUserId, 30),
      ])
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.warn(`refreshFuelData partial fail [${i}]`, r.reason)
        }
      })
      // No pisar estado local si un fetch falla — evita que un guardado reciente “desaparezca”.
      if (results[0].status === 'fulfilled') {
        setFuelProfile(results[0].value)
      }
      if (results[1].status === 'fulfilled') {
        const logs = results[1].value
        setFuelTodayLogs(logs)
        setFuelTodayTotals(sumFuelLogs(logs))
      }
      if (results[2].status === 'fulfilled') {
        setFuelWeekDays(results[2].value)
      }
      if (results[3].status === 'fulfilled') {
        setFuelWeekMacros(results[3].value)
      }
      if (results[4].status === 'fulfilled') {
        const workouts = results[4].value
        setFuelTodayWorkouts(workouts)
        setFuelPostWorkoutTip(workouts[0] ? getPostWorkoutFuelTip(workouts[0].type) : undefined)
      }
      if (results[5].status === 'fulfilled') {
        setFuelWeekWorkouts(results[5].value)
      }
    } catch (e) {
      console.warn('refreshFuelData failed', e)
    }
  }, [isDemoMode, db, firebaseUserUid, effectiveUserId])

  const syncFuelDayState = useCallback(
    (nextLogs: FuelLogEntry[]) => {
      setFuelTodayLogs(nextLogs)
      setFuelTodayTotals(sumFuelLogs(nextLogs))
      const loggedDates = new Set(nextLogs.map((l) => l.date))
      if (isDemoMode) {
        const today = toLocalDateStr()
        if (nextLogs.length > 0) loggedDates.add(today)
        setFuelWeekDays(computeFuelWeekFromDates(loggedDates))
      }
    },
    [isDemoMode]
  )

  useEffect(() => {
    if (!firebaseUserUid || isDemoMode) return
    refreshFuelData().catch(() => {})
  }, [firebaseUserUid, isDemoMode, refreshFuelData])

  return {
    savingFuel,
    setSavingFuel,
    fuelProfile,
    setFuelProfile,
    fuelTodayLogs,
    setFuelTodayLogs,
    fuelTodayTotals,
    setFuelTodayTotals,
    fuelWeekDays,
    setFuelWeekDays,
    fuelWeekMacros,
    setFuelWeekMacros,
    editingFuelLog,
    setEditingFuelLog,
    deletingFuelLogId,
    setDeletingFuelLogId,
    fuelPostWorkoutTip,
    setFuelPostWorkoutTip,
    fuelTodayWorkouts,
    setFuelTodayWorkouts,
    fuelWeekWorkouts,
    setFuelWeekWorkouts,
    refreshFuelData,
    syncFuelDayState,
  }
}
