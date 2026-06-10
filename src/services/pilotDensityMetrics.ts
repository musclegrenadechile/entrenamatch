/**
 * Fase 121 Bloque D — métricas de densidad del piloto (invites, QR, stories, Sync Hour).
 * Aggregate: pilotDensityWeekly/{cityNorm__weekKey}
 */

import type { Firestore } from 'firebase/firestore'
import { getWeekKey } from '../utils/weekLiveTracker'
import { normalizeCity } from './localNetwork'
import { isOpenPilotCity } from '../constants/pilotProgram'
import { pilotWeeklyDocId } from './pilotSyncMetrics'

export type PilotDensityEventKind =
  | 'invite_shared'
  | 'gym_qr_open'
  | 'sync_story_shared'
  | 'sync_hour_cta'

export type PilotDensityWeeklyDoc = {
  cityNorm: string
  cityLabel: string
  weekKey: string
  invitesShared: number
  gymQrOpens: number
  syncStoriesShared: number
  syncHourClicks: number
  lastEventAt: number
}

const FIELD_BY_KIND: Record<
  PilotDensityEventKind,
  keyof Pick<
    PilotDensityWeeklyDoc,
    'invitesShared' | 'gymQrOpens' | 'syncStoriesShared' | 'syncHourClicks'
  >
> = {
  invite_shared: 'invitesShared',
  gym_qr_open: 'gymQrOpens',
  sync_story_shared: 'syncStoriesShared',
  sync_hour_cta: 'syncHourClicks',
}

export function pilotDensityDocId(cityNorm: string, weekKey: string): string {
  return pilotWeeklyDocId(cityNorm, weekKey)
}

export function buildEmptyPilotDensityWeekly(
  cityNorm: string,
  cityLabel: string,
  weekKey: string
): PilotDensityWeeklyDoc {
  return {
    cityNorm,
    cityLabel,
    weekKey,
    invitesShared: 0,
    gymQrOpens: 0,
    syncStoriesShared: 0,
    syncHourClicks: 0,
    lastEventAt: Date.now(),
  }
}

export type PilotDensityHealth = 'cold' | 'warming' | 'active'

export function computePilotDensityHealth(input: {
  memberCount: number
  weeklySyncs: number
  weeklyInvites: number
  liveNow?: number
}): { health: PilotDensityHealth; label: string; score: number } {
  const { memberCount, weeklySyncs, weeklyInvites, liveNow = 0 } = input
  let score = 0
  if (memberCount >= 50) score += 40
  else if (memberCount >= 20) score += 25
  else if (memberCount >= 10) score += 15
  else score += memberCount

  if (weeklySyncs >= 3) score += 35
  else if (weeklySyncs >= 1) score += 25

  if (weeklyInvites >= 10) score += 15
  else if (weeklyInvites >= 3) score += 10
  else if (weeklyInvites >= 1) score += 5

  if (liveNow >= 3) score += 10
  else if (liveNow >= 1) score += 5

  if (memberCount >= 50 && weeklySyncs >= 1) {
    return { health: 'active', label: 'Comunidad activa — sigue invitando', score }
  }
  if (memberCount >= 10 || weeklySyncs >= 1 || weeklyInvites >= 3) {
    return { health: 'warming', label: 'Creciendo — cada invite y LIVE suma', score }
  }
  return { health: 'cold', label: 'Densidad baja — invita a tu gym esta semana', score }
}

export async function recordPilotDensityEvent(
  db: Firestore | null,
  params: {
    city?: string | null
    kind: PilotDensityEventKind
    weekKey?: string
    isDemoMode?: boolean
  }
): Promise<void> {
  if (!db || params.isDemoMode || !isOpenPilotCity(params.city)) return
  const cityNorm = normalizeCity(params.city)
  if (!cityNorm) return

  const weekKey = params.weekKey ?? getWeekKey()
  const cityLabel = params.city?.trim() || cityNorm
  const docId = pilotDensityDocId(cityNorm, weekKey)
  const field = FIELD_BY_KIND[params.kind]
  const now = Date.now()

  const { doc, getDoc, setDoc, updateDoc, increment } = await import('firebase/firestore')
  const ref = doc(db, 'pilotDensityWeekly', docId)

  try {
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      const base = buildEmptyPilotDensityWeekly(cityNorm, cityLabel, weekKey)
      base[field] = 1
      base.lastEventAt = now
      await setDoc(ref, base)
      return
    }
    await updateDoc(ref, {
      [field]: increment(1),
      lastEventAt: now,
    })
  } catch (e) {
    console.warn('[pilotDensityMetrics] record failed', params.kind, e)
  }
}

export function attachPilotDensityListener(
  db: Firestore,
  cityNorm: string,
  weekKey: string,
  onData: (doc: PilotDensityWeeklyDoc | null) => void
): () => void {
  let cancelled = false
  let unsub: (() => void) | null = null

  ;(async () => {
    const { doc, onSnapshot } = await import('firebase/firestore')
    if (cancelled) return
    unsub = onSnapshot(
      doc(db, 'pilotDensityWeekly', pilotDensityDocId(cityNorm, weekKey)),
      (snap) => {
        if (cancelled) return
        if (!snap.exists()) {
          onData(null)
          return
        }
        const d = snap.data() as Record<string, unknown>
        onData({
          cityNorm: String(d.cityNorm || cityNorm),
          cityLabel: String(d.cityLabel || cityNorm),
          weekKey: String(d.weekKey || weekKey),
          invitesShared: Number(d.invitesShared) || 0,
          gymQrOpens: Number(d.gymQrOpens) || 0,
          syncStoriesShared: Number(d.syncStoriesShared) || 0,
          syncHourClicks: Number(d.syncHourClicks) || 0,
          lastEventAt: Number(d.lastEventAt) || 0,
        })
      },
      () => {
        if (!cancelled) onData(null)
      }
    )
  })()

  return () => {
    cancelled = true
    unsub?.()
  }
}
