import { Capacitor } from '@capacitor/core'

import { useCallback, useEffect, useRef } from 'react'

import type { Firestore } from 'firebase/firestore'

import { ensureCapacitorPlugins, getCapacitorApp } from '../utils/capacitorRuntimePlugins'

import { toLocalDateStr } from '../utils/fuelCalculator'

import { withTimeout } from '../utils/withTimeout'

import {

  loadCachedWearableDayActivity,

  syncWearableDayActivity,

  type WearableDayActivity,

} from '../services/wearableSync'



const SYNC_INTERVAL_MS = 30 * 60 * 1000

const RESUME_DEBOUNCE_MS = 2_000

/** Hard cap — Samsung HC can hang; UI must never stay in "syncing" forever. */

const AUTO_SYNC_TIMEOUT_MS = 32_000

const FULL_SYNC_TIMEOUT_MS = 50_000



export type UseWearableAutoSyncOptions = {

  enabled: boolean

  userId: string | undefined

  db: Firestore | null

  wearableConnected: boolean

  onSynced: (activity: WearableDayActivity) => void

  onSyncingChange?: (syncing: boolean) => void

}



export function useWearableAutoSync(options: UseWearableAutoSyncOptions): {

  /** full=true: manual import (steps+kcal+workouts). Default: fast background sync. */

  syncNow: (full?: boolean) => Promise<WearableDayActivity | null>

} {

  const { enabled, userId, db, wearableConnected, onSynced, onSyncingChange } = options

  const syncingRef = useRef(false)

  const lastSyncAtRef = useRef(0)

  const onSyncedRef = useRef(onSynced)

  const onSyncingChangeRef = useRef(onSyncingChange)



  onSyncedRef.current = onSynced

  onSyncingChangeRef.current = onSyncingChange



  const runSync = useCallback(

    async (force = false, full = false): Promise<WearableDayActivity | null> => {

      if (!enabled || !userId || !Capacitor.isNativePlatform()) return null

      if (syncingRef.current) return null

      const now = Date.now()

      if (!force && now - lastSyncAtRef.current < RESUME_DEBOUNCE_MS) return null



      const showSpinner = full

      const hardTimeout = full ? FULL_SYNC_TIMEOUT_MS : AUTO_SYNC_TIMEOUT_MS

      syncingRef.current = true

      if (showSpinner) onSyncingChangeRef.current?.(true)



      const releaseBusy = () => {

        syncingRef.current = false

        if (showSpinner) onSyncingChangeRef.current?.(false)

      }



      const watchdogId = window.setTimeout(releaseBusy, hardTimeout + 3_000)



      try {

        const dateStr = toLocalDateStr()

        const activity = await withTimeout(

          syncWearableDayActivity(dateStr, {

            userId,

            db: db || undefined,

            persist: !!db,

            autoSync: !full,

          }),

          hardTimeout,

          'wearable sync timeout'

        )

        lastSyncAtRef.current = Date.now()

        onSyncedRef.current(activity)

        return activity

      } catch (e) {

        console.warn('[useWearableAutoSync]', e)

        if (db) {

          const cached = await loadCachedWearableDayActivity(db, userId, toLocalDateStr())

          if (cached) {

            const fallback = { ...cached, pendingRefresh: true }

            onSyncedRef.current(fallback)

            return fallback

          }

        }

        return null

      } finally {

        window.clearTimeout(watchdogId)

        releaseBusy()

      }

    },

    [enabled, userId, db]

  )



  // Hydrate from Firestore cache for instant UI.

  useEffect(() => {

    if (!enabled || !userId || !db) return

    void loadCachedWearableDayActivity(db, userId, toLocalDateStr()).then((cached) => {

      if (cached) onSyncedRef.current(cached)

    })

  }, [enabled, userId, db])



  // Initial sync + periodic while app is open.

  useEffect(() => {

    if (!enabled || !userId) return undefined

    void runSync(true)

    const intervalId = window.setInterval(() => {

      if (document.visibilityState === 'visible') void runSync()

    }, SYNC_INTERVAL_MS)

    return () => window.clearInterval(intervalId)

  }, [enabled, userId, wearableConnected, runSync])



  // Resume from background.

  useEffect(() => {

    if (!enabled || !userId) return undefined



    const onVisible = () => {

      if (document.visibilityState === 'visible') void runSync()

    }

    document.addEventListener('visibilitychange', onVisible)



    let resumeHandle: { remove: () => void } | null = null

    void (async () => {

      try {

        if (!Capacitor.isNativePlatform()) return

        await ensureCapacitorPlugins()

        const App = getCapacitorApp()

        if (!App) return

        resumeHandle = await App.addListener('resume', () => {

          void runSync()

        })

      } catch {

        /* optional */

      }

    })()



    return () => {

      document.removeEventListener('visibilitychange', onVisible)

      resumeHandle?.remove()

    }

  }, [enabled, userId, runSync])



  return {

    syncNow: (full = false) => runSync(true, full),

  }

}


