/**
 * EntrenaCoach Fase 2 — Mercado Pago Checkout Pro vía Cloud Function.
 */

import { app as firebaseApp } from './firebase'

export interface TrainerMpCheckoutResult {
  initPoint: string
  preferenceId: string
  platformFeeClp: number
  /** Si MP no está configurado en el servidor */
  fallbackPaymentUrl?: string
  usedFallback?: boolean
}

export async function createTrainerMpCheckout(bookingId: string): Promise<TrainerMpCheckoutResult> {
  if (!firebaseApp) throw new Error('Firebase not initialized')
  const { getFunctions, httpsCallable } = await import('firebase/functions')
  const functions = getFunctions(firebaseApp, 'us-central1')
  const fn = httpsCallable<{ bookingId: string }, TrainerMpCheckoutResult>(
    functions,
    'createTrainerMpCheckout'
  )
  const res = await fn({ bookingId })
  return res.data
}
