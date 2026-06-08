/**
 * EntrenaCoach Fase 2 — Mercado Pago Checkout Pro vía Cloud Function.
 */

import { app as firebaseApp } from './firebase'

export interface TrainerMpCheckoutResult {
  initPoint: string
  preferenceId: string
  platformFeeClp: number
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

/** Checkout Mercado Pago — cobro en cuenta EntrenaMatch (marketplace). */
export async function payTrainerBooking(bookingId: string): Promise<TrainerMpCheckoutResult> {
  return createTrainerMpCheckout(bookingId)
}

export function openTrainerPaymentCheckout(result: TrainerMpCheckoutResult): void {
  window.open(result.initPoint, '_blank', 'noopener,noreferrer')
}
