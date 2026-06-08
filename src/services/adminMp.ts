/**
 * Admin Mercado Pago — health check y liquidaciones PT (marketplaceAdmins).
 */

import { app as firebaseApp } from './firebase'

export interface MpHealthResult {
  configured: boolean
  live: boolean
  hasWebhook: boolean
  webhookUrl: string
  webhookSecretConfigured?: boolean
  marketplaceModel?: boolean
  mpUserId?: string | null
  mpNickname?: string | null
  mpError?: string
}

export async function fetchMpHealth(): Promise<MpHealthResult | null> {
  if (!firebaseApp) return null
  const { getFunctions, httpsCallable } = await import('firebase/functions')
  const fn = httpsCallable<unknown, MpHealthResult>(
    getFunctions(firebaseApp, 'us-central1'),
    'checkMpHealth'
  )
  const res = await fn({})
  return res.data
}

export async function markTrainerPayoutStatus(
  bookingId: string,
  status: 'processing' | 'paid'
): Promise<void> {
  if (!firebaseApp) throw new Error('Firebase not initialized')
  const { getFunctions, httpsCallable } = await import('firebase/functions')
  const fn = httpsCallable<{ bookingId: string; status: string }, { ok: boolean }>(
    getFunctions(firebaseApp, 'us-central1'),
    'markTrainerPayoutStatus'
  )
  await fn({ bookingId, status })
}
