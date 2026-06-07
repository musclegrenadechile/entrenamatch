/**
 * Error reporting for beta — Firestore breadcrumbs + native Crashlytics (APK uncaught).
 * Native Android crashes are handled by FirebaseCrashlytics in MainActivity.java.
 */

import { Capacitor } from '@capacitor/core'
import { APP_VERSION } from '../constants'

/** Fire-and-forget — safe from error handlers. */
export function reportError(error: unknown, context?: string, fatal = false): void {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error'
  const stack = error instanceof Error ? error.stack : undefined

  console.error('[EntrenaMatch]', context || 'error', message, stack)

  void (async () => {
    try {
      const { db, isFirebaseConfigured } = await import('./firebase')
      const { getAuth } = await import('firebase/auth')
      if (!isFirebaseConfigured || !db) return
      const uid = getAuth().currentUser?.uid
      if (!uid) return
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      await addDoc(collection(db, 'clientErrorReports'), {
        userId: uid,
        message: message.slice(0, 2000),
        stack: (stack || '').slice(0, 8000),
        context: context || null,
        fatal,
        appVersion: APP_VERSION,
        platform: Capacitor.getPlatform(),
        createdAt: serverTimestamp(),
      })
    } catch {
      // Never throw from reporter
    }
  })()
}

export function initCrashReporting(): void {
  // Native Crashlytics enabled in MainActivity; nothing else required at boot.
}
