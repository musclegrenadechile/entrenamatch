/**
 * Post-sync share funnel — offers vs publishes vs skips (Fase 100 / paso 10).
 * Aggregate: syncShareWeekly/{uid__weekKey}
 */

import type { Firestore } from 'firebase/firestore'
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore'
import { getWeekKey } from '../utils/weekLiveTracker'
import { normalizeCity } from './localNetwork'

export type SyncShareMetricKind = 'offer' | 'publish' | 'skip' | 'opt_out'

export type SyncShareWeeklyDoc = {
  uid: string
  weekKey: string
  cityNorm: string | null
  offers: number
  publishes: number
  skips: number
  optOutSets: number
  lastEventAt: number
}

export function syncShareWeeklyDocId(uid: string, weekKey: string): string {
  const raw = `${uid}__${weekKey}`.replace(/[^a-zA-Z0-9_-]/g, '_')
  return raw.slice(0, 120) || 'unknown'
}

export function buildEmptySyncShareWeekly(
  uid: string,
  weekKey: string,
  cityNorm: string | null = null
): SyncShareWeeklyDoc {
  return {
    uid,
    weekKey,
    cityNorm,
    offers: 0,
    publishes: 0,
    skips: 0,
    optOutSets: 0,
    lastEventAt: Date.now(),
  }
}

const FIELD_BY_KIND: Record<SyncShareMetricKind, keyof Pick<SyncShareWeeklyDoc, 'offers' | 'publishes' | 'skips' | 'optOutSets'>> = {
  offer: 'offers',
  publish: 'publishes',
  skip: 'skips',
  opt_out: 'optOutSets',
}

export function publishRatePct(doc: SyncShareWeeklyDoc): number {
  if (doc.offers <= 0) return 0
  return Math.round((doc.publishes / doc.offers) * 100)
}

export async function recordSyncShareMetric(
  db: Firestore | null,
  params: {
    uid: string
    kind: SyncShareMetricKind
    city?: string | null
    weekKey?: string
    isDemoMode?: boolean
  }
): Promise<void> {
  if (!db || params.isDemoMode || !params.uid || params.uid === 'me') return
  const weekKey = params.weekKey ?? getWeekKey()
  const docId = syncShareWeeklyDocId(params.uid, weekKey)
  const ref = doc(db, 'syncShareWeekly', docId)
  const field = FIELD_BY_KIND[params.kind]
  const cityNorm = params.city ? normalizeCity(params.city) : null
  const now = Date.now()

  try {
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      const base = buildEmptySyncShareWeekly(params.uid, weekKey, cityNorm)
      base[field] = 1
      base.lastEventAt = now
      await setDoc(ref, base)
      return
    }
    await updateDoc(ref, {
      [field]: increment(1),
      lastEventAt: now,
      ...(cityNorm && !snap.data()?.cityNorm ? { cityNorm } : {}),
    })
  } catch (e) {
    console.warn('[syncShare] metric failed', params.kind, e)
  }
}
