/**

 * W1a+ — Auto-sync wearable day activity (steps, kcal, workouts) from Health Connect / Apple Health.

 */



import { Capacitor } from '@capacitor/core'

import type { Firestore } from 'firebase/firestore'

import { ensureHealthPluginReady, getCapacitorHealth } from '../utils/capacitorRuntimePlugins'
import { withTimeout } from '../utils/withTimeout'

import { loadWearableDailyCache, saveWearableDailyCache } from './wearableDaily'

import {

  androidRuntimeHealthPermissionsGranted,

  fetchWearableDaySummary,

  quickWearablePermissionCheck,

  type WearablePlatform,

} from './wearableHealth'



export type WearableDayActivity = {

  date: string

  steps: number

  activeCaloriesKcal: number

  exerciseMinutes: number

  workoutCount: number

  sources: string[]

  needsConnect?: boolean

  message?: string

  syncedAt: number

  fromCache?: boolean

  pendingRefresh?: boolean

}



export function wearableActivityHasData(a: WearableDayActivity | null | undefined): boolean {

  if (!a) return false

  return a.steps > 0 || a.activeCaloriesKcal > 0 || a.exerciseMinutes > 0 || a.workoutCount > 0

}



function summaryToActivity(

  summary: Awaited<ReturnType<typeof fetchWearableDaySummary>>,

  extras?: Partial<WearableDayActivity>

): WearableDayActivity {

  return {

    date: summary.date,

    steps: summary.steps,

    activeCaloriesKcal: summary.activeCaloriesKcal,

    exerciseMinutes: summary.exerciseMinutes,

    workoutCount: summary.workoutCount,

    sources: summary.sources,

    syncedAt: Date.now(),

    ...extras,

  }

}



function cacheToActivity(doc: Awaited<ReturnType<typeof loadWearableDailyCache>>): WearableDayActivity | null {

  if (!doc) return null

  return {

    date: doc.date,

    steps: doc.steps,

    activeCaloriesKcal: doc.activeCaloriesKcal,

    exerciseMinutes: doc.exerciseMinutes,

    workoutCount: doc.workoutCount,

    sources: doc.sources || [],

    syncedAt: doc.syncedAt,

    fromCache: true,

  }

}



/** Prefer fresher non-zero fields from live read over cache. */

function mergeActivity(

  live: WearableDayActivity,

  cached: WearableDayActivity | null

): WearableDayActivity {

  if (!cached) return live

  return {

    date: live.date,

    steps: live.steps > 0 ? live.steps : cached.steps,

    activeCaloriesKcal:

      live.activeCaloriesKcal > 0 ? live.activeCaloriesKcal : cached.activeCaloriesKcal,

    exerciseMinutes: live.exerciseMinutes > 0 ? live.exerciseMinutes : cached.exerciseMinutes,

    workoutCount: live.workoutCount > 0 ? live.workoutCount : cached.workoutCount,

    sources: live.sources.length > 0 ? live.sources : cached.sources,

    syncedAt: wearableActivityHasData(live) ? live.syncedAt : cached.syncedAt,

    fromCache: !wearableActivityHasData(live) && wearableActivityHasData(cached),

    pendingRefresh: false,

  }

}



export async function loadCachedWearableDayActivity(

  db: Firestore,

  userId: string,

  dateStr: string

): Promise<WearableDayActivity | null> {

  try {

    return cacheToActivity(await loadWearableDailyCache(db, userId, dateStr))

  } catch {

    return null

  }

}



export type SyncWearableDayOptions = {

  userId?: string

  db?: Firestore | null

  persist?: boolean

  /** Background sync — minimal HC reads, no error toast messaging. */

  autoSync?: boolean

}



export async function syncWearableDayActivity(

  dateStr: string,

  options?: SyncWearableDayOptions

): Promise<WearableDayActivity> {

  const empty: WearableDayActivity = {

    date: dateStr,

    steps: 0,

    activeCaloriesKcal: 0,

    exerciseMinutes: 0,

    workoutCount: 0,

    sources: [],

    syncedAt: Date.now(),

  }



  if (!Capacitor.isNativePlatform()) {

    return {

      ...empty,

      message: 'Actividad del reloj solo en la app iOS/Android.',

    }

  }



  if (!getCapacitorHealth()) {
    try {
      await withTimeout(ensureHealthPluginReady(), 4_000, 'health plugin ready')
    } catch {
      if (!getCapacitorHealth()) {
        if (options?.userId && options?.db) {
          const earlyCached = await loadCachedWearableDayActivity(
            options.db,
            options.userId,
            dateStr
          )
          if (earlyCached && wearableActivityHasData(earlyCached)) {
            return { ...earlyCached, pendingRefresh: true }
          }
        }
        return {
          ...empty,
          message: 'Plugin de salud no cargado. Cierra y abre EntrenaMatch.',
        }
      }
    }
  }

  const platform = (Capacitor.getPlatform() || 'android') as WearablePlatform



  const cached =

    options?.userId && options?.db

      ? await loadCachedWearableDayActivity(options.db, options.userId, dateStr)

      : null



  const canRead =

    platform === 'android'

      ? await androidRuntimeHealthPermissionsGranted()

      : (await quickWearablePermissionCheck(platform)).connected



  if (!canRead) {

    if (cached && wearableActivityHasData(cached)) {

      return { ...cached, needsConnect: false, pendingRefresh: true }

    }

    const perm = await quickWearablePermissionCheck(platform)

    return {

      ...empty,

      needsConnect: true,

      message:

        perm.reason ||

        'Perfil → Conectar wearable → autoriza pasos y calorías en Health Connect.',

    }

  }



  let summary: Awaited<ReturnType<typeof fetchWearableDaySummary>>

  try {

    summary = await fetchWearableDaySummary(dateStr, {

      assumeConnected: true,

      platform,

      fastImport: true,

      autoSync: options?.autoSync ?? false,

      workoutLimit: options?.autoSync ? 10 : 8,

    })

  } catch (e) {

    console.warn('[syncWearableDayActivity]', e)

    if (cached && wearableActivityHasData(cached)) {

      return {

        ...cached,

        pendingRefresh: true,

        message: options?.autoSync

          ? undefined

          : 'Health Connect no respondió. Mostrando última sync guardada.',

      }

    }

    return {

      ...empty,

      message: options?.autoSync

        ? undefined

        : 'Health Connect tardó en responder. Abre Health Connect, espera que cargue y reintenta.',

      pendingRefresh: true,

    }

  }



  let activity = summaryToActivity(summary)

  activity = mergeActivity(activity, cached)



  if (!wearableActivityHasData(activity)) {

    activity.message =

      platform === 'android'

        ? 'Sin datos en Health Connect hoy. Abre Health Connect y confirma que ves tus ejercicios. Huawei: Health Sync debe enviar actividad (no solo pasos).'

        : 'Sin datos del reloj hoy. Entrena con el reloj y abre EntrenaMatch de nuevo.'

  } else if (activity.workoutCount > 0 || activity.exerciseMinutes > 0) {

    activity.message =
      activity.workoutCount > 0
        ? `${activity.workoutCount} ejercicio(s) del reloj hoy.`
        : `${activity.exerciseMinutes} min de ejercicio hoy.`

  } else if (activity.sources.length > 0) {

    activity.message = `Sincronizado desde ${activity.sources.slice(0, 2).join(', ')}.`

  } else if (options?.autoSync) {

    activity.message = undefined

  }



  if (options?.persist && options.userId && options.db && wearableActivityHasData(activity)) {

    try {

      await saveWearableDailyCache(options.db, options.userId, {

        date: dateStr,

        steps: activity.steps,

        activeCaloriesKcal: activity.activeCaloriesKcal,

        exerciseMinutes: activity.exerciseMinutes,

        workoutCount: activity.workoutCount,

        sources: activity.sources,

        platform,

        syncedAt: activity.syncedAt,

      })

    } catch {

      /* offline */

    }

  }



  return activity

}


