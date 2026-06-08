/**
 * Marketplace — Mercado Pago Checkout Pro vía Cloud Function.
 */

import { app as firebaseApp } from './firebase'

export interface MarketplaceMpCheckoutResult {
  initPoint: string
  preferenceId: string
  fallbackPaymentUrl?: string
  usedFallback?: boolean
}

export async function createMarketplaceMpCheckout(
  orderId: string
): Promise<MarketplaceMpCheckoutResult> {
  if (!firebaseApp) throw new Error('Firebase not initialized')
  const { getFunctions, httpsCallable } = await import('firebase/functions')
  const functions = getFunctions(firebaseApp, 'us-central1')
  const fn = httpsCallable<{ orderId: string }, MarketplaceMpCheckoutResult>(
    functions,
    'createMarketplaceMpCheckout'
  )
  const res = await fn({ orderId })
  return res.data
}
