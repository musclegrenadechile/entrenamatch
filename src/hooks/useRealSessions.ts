/**
 * Real-mode training sessions — bootstrap fetch, RT listener, 30s poll fallback.
 */

import { useState, useEffect, useCallback } from 'react'
import type { Firestore } from 'firebase/firestore'
import type { TrainingSession } from '../types'
import { attachSessionsListener, fetchTrainingSessions } from '../services/sessions'

export function useRealSessions(
  db: Firestore | null | undefined,
  opts: {
    isDemoMode: boolean
    firebaseUid?: string | null
    onSync?: (at: Date) => void
  }
) {
  const { isDemoMode, firebaseUid, onSync } = opts
  const [realSessions, setRealSessions] = useState<TrainingSession[]>([])

  const loadRealSessions = useCallback(async () => {
    if (!db || isDemoMode) {
      setRealSessions([])
      return
    }
    try {
      const loaded = await fetchTrainingSessions(db)
      setRealSessions(loaded)
      onSync?.(new Date())
    } catch (err) {
      console.warn('Could not load real sessions yet:', err)
      setRealSessions([])
    }
  }, [db, isDemoMode, onSync])

  useEffect(() => {
    if (isDemoMode || !firebaseUid || !db) return
    const interval = setInterval(() => {
      loadRealSessions()
    }, 30000)
    return () => clearInterval(interval)
  }, [isDemoMode, firebaseUid, db, loadRealSessions])

  useEffect(() => {
    if (isDemoMode || !firebaseUid || !db) return
    return attachSessionsListener(
      db,
      (loaded) => {
        setRealSessions(loaded)
        onSync?.(new Date())
        console.log(`📡 Live sessions update: ${loaded.length} sessions from Firestore`)
      },
      {
        onError: (err) => console.warn('Sessions live listener error (may need index or rules):', err),
      }
    )
  }, [isDemoMode, firebaseUid, db, onSync])

  return { realSessions, setRealSessions, loadRealSessions }
}
