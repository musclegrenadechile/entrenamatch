import { useCallback, useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import type { Firestore } from 'firebase/firestore'
import { toast } from 'sonner'
import type { CurrentUser } from '../types'
import { loadDailyEnergyCache } from '../services/dailyEnergy'
import {
  syncWearableDayActivity,
  wearableActivityHasData,
  type WearableDayActivity,
} from '../services/wearableSync'
import { toLocalDateStr } from '../utils/fuelCalculator'
import { useWearableAutoSync } from './useWearableAutoSync'

export type UseWearableFuelIntegrationArgs = {
  enabled: boolean
  userId: string | null
  db: Firestore | null
  isDemoMode: boolean
  currentUser: CurrentUser | null
  saveUserWithRealSync: (user: CurrentUser) => Promise<void>
}

export function useWearableFuelIntegration({
  enabled,
  userId,
  db,
  isDemoMode,
  currentUser,
  saveUserWithRealSync,
}: UseWearableFuelIntegrationArgs) {
  const [healthBurnBonus, setHealthBurnBonus] = useState(0)
  const [wearableActivity, setWearableActivity] = useState<WearableDayActivity | null>(null)
  const [wearableSyncing, setWearableSyncing] = useState(false)
  const [healthImportHint, setHealthImportHint] = useState<string | undefined>()

  const applyWearableActivityRef = useRef<(activity: WearableDayActivity) => Promise<void>>(
    async () => {}
  )

  useEffect(() => {
    if (!userId || isDemoMode || !db) return
    loadDailyEnergyCache(db, userId, toLocalDateStr())
      .then((doc) => {
        if (doc?.healthBurnKcal && doc.healthBurnKcal > 0) {
          setHealthBurnBonus(doc.healthBurnKcal)
        }
      })
      .catch(() => {})
  }, [userId, isDemoMode, db])

  const applyWearableActivity = useCallback(
    async (activity: WearableDayActivity) => {
      setWearableActivity((prev) => {
        if (
          activity.pendingRefresh &&
          !wearableActivityHasData(activity) &&
          prev &&
          wearableActivityHasData(prev)
        ) {
          return prev
        }
        return activity
      })
      if (activity.activeCaloriesKcal > 0) {
        setHealthBurnBonus(activity.activeCaloriesKcal)
      }
      if (activity.message && !activity.pendingRefresh) {
        const hint =
          activity.exerciseMinutes > 0
            ? `${activity.message} · ${activity.exerciseMinutes} min ejercicio`
            : activity.message
        setHealthImportHint(hint)
      }
      if (
        wearableActivityHasData(activity) &&
        !isDemoMode &&
        currentUser &&
        !currentUser.wearableHealthConnected
      ) {
        try {
          await saveUserWithRealSync({
            ...currentUser,
            wearableHealthConnected: true,
            wearableHealthPlatform: Capacitor.getPlatform() === 'ios' ? 'ios' : 'android',
            wearableHealthConnectedAt: Date.now(),
          } as CurrentUser)
        } catch {
          /* offline */
        }
      }
    },
    [isDemoMode, currentUser, saveUserWithRealSync]
  )

  applyWearableActivityRef.current = applyWearableActivity

  const { syncNow: syncWearableNow } = useWearableAutoSync({
    enabled: enabled && Capacitor.isNativePlatform(),
    userId,
    db,
    wearableConnected: !!currentUser?.wearableHealthConnected,
    onSynced: (activity) => {
      void applyWearableActivity(activity)
    },
    onSyncingChange: setWearableSyncing,
  })

  const handleImportHealthBurn = useCallback(async () => {
    const loadingId = toast.loading('Leyendo datos del reloj…', {
      description: 'Health Connect / Apple Health',
    })
    try {
      const activity = await syncWearableNow(true)
      await applyWearableActivity(activity)

      if (activity.activeCaloriesKcal > 0) {
        toast.success(`+${activity.activeCaloriesKcal} kcal desde wearable`, {
          description:
            activity.steps > 0
              ? `${activity.steps.toLocaleString('es-CL')} pasos · ${activity.exerciseMinutes || 0} min`
              : activity.message,
        })
        return
      }

      if (activity.needsConnect) {
        toast.info(activity.message || 'Conecta tu wearable', {
          description: 'Perfil → Conectar wearable → pasos y calorías activas.',
          duration: 8000,
        })
        return
      }

      toast.info(activity.message || 'Sin datos del reloj hoy', {
        description:
          activity.workoutCount > 0
            ? `${activity.workoutCount} workout(s) — revisa Health Sync → Health Connect.`
            : activity.steps > 0
              ? `${activity.steps.toLocaleString('es-CL')} pasos detectados.`
              : 'Huawei: Health Sync debe enviar pasos y calorías a Health Connect.',
        duration: 8000,
      })
    } catch (e) {
      console.warn('[handleImportHealthBurn]', e)
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as Error).message) : ''
      toast.error('Error al importar desde wearable', {
        description: msg || 'Cierra y abre la app, luego reintenta.',
        duration: 8000,
      })
      throw e
    } finally {
      toast.dismiss(loadingId)
    }
  }, [syncWearableNow, applyWearableActivity])

  const refreshWearableDayBurn = useCallback(async () => {
    const activity = await syncWearableDayActivity(toLocalDateStr(), {
      userId: userId ?? undefined,
      db: db ?? undefined,
      persist: !!db,
    })
    await applyWearableActivityRef.current(activity)
  }, [userId, db])

  return {
    healthBurnBonus,
    wearableActivity,
    wearableSyncing,
    healthImportHint,
    applyWearableActivity,
    applyWearableActivityRef,
    syncWearableNow,
    handleImportHealthBurn,
    refreshWearableDayBurn,
  }
}
