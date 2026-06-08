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

/** Abre checkout MP para pedido pendiente (Mis pedidos). */
export async function openMarketplacePayment(
  orderId: string,
  fallbackPaymentUrl?: string
): Promise<{ usedFallback: boolean }> {
  try {
    const mp = await createMarketplaceMpCheckout(orderId)
    window.open(mp.initPoint, '_blank', 'noopener,noreferrer')
    return { usedFallback: !!mp.usedFallback }
  } catch (err) {
    if (fallbackPaymentUrl?.startsWith('https://')) {
      window.open(fallbackPaymentUrl, '_blank', 'noopener,noreferrer')
      return { usedFallback: true }
    }
    throw err
  }
}
