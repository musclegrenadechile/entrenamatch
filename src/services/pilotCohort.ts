/**
 * Closed pilot cohort — Viña + Santiago (target 50–200 MAU).
 * pilotCohort/{cityNorm} — aggregate counts
 * pilotCohort/{cityNorm}/members/{uid} — member registry
 */

import type { Firestore } from 'firebase/firestore'
import {
  isOpenPilotCity,
  PILOT_TARGET_MAU_MAX,
  PILOT_TARGET_MAU_MIN,
  pilotCityLabel,
} from '../constants/pilotProgram'
import { normalizeCity } from './localNetwork'

export type PilotCohortDoc = {
  cityNorm: string
  cityLabel: string
  memberCount: number
  activeLast7d: number
  updatedAt?: unknown
}

const ACTIVE_TOUCH_KEY = 'entrenamatch_pilot_active_touch'

export function pilotCohortDocId(cityNorm: string): string {
  return cityNorm.replace(/[^a-z0-9_-]/g, '_').slice(0, 80) || 'unknown'
}

export function shouldRegisterPilotMember(city?: string | null): boolean {
  return isOpenPilotCity(city)
}

export async function registerPilotMember(
  db: Firestore,
  params: {
    uid: string
    city: string
    displayName?: string
  }
): Promise<{ registered: boolean; reason?: string }> {
  const cityNorm = normalizeCity(params.city)
  if (!isOpenPilotCity(params.city)) return { registered: false, reason: 'not_pilot_city' }
  if (!params.uid || params.uid.length < 20) return { registered: false, reason: 'invalid_uid' }

  const cityLabel = pilotCityLabel(params.city) || params.city.trim()
  const { doc, runTransaction, serverTimestamp } = await import('firebase/firestore')
  const cohortRef = doc(db, 'pilotCohort', pilotCohortDocId(cityNorm))
  const memberRef = doc(db, 'pilotCohort', pilotCohortDocId(cityNorm), 'members', params.uid)

  try {
    await runTransaction(db, async (tx) => {
      const memberSnap = await tx.get(memberRef)
      if (memberSnap.exists()) return

      const cohortSnap = await tx.get(cohortRef)
      if (cohortSnap.exists()) {
        const prev = cohortSnap.data() as PilotCohortDoc
        tx.update(cohortRef, {
          memberCount: (prev.memberCount || 0) + 1,
          activeLast7d: (prev.activeLast7d || 0) + 1,
          updatedAt: serverTimestamp(),
        })
      } else {
        tx.set(cohortRef, {
          cityNorm,
          cityLabel,
          memberCount: 1,
          activeLast7d: 1,
          updatedAt: serverTimestamp(),
        })
      }

      tx.set(memberRef, {
        uid: params.uid,
        displayName: params.displayName?.slice(0, 80) || null,
        cityNorm,
        cityLabel,
        joinedAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
      })
    })
    return { registered: true }
  } catch (e) {
    console.warn('[pilotCohort] register failed', e)
    return { registered: false, reason: 'firestore_error' }
  }
}

/** Once per local day — bumps activeLast7d on cohort (approximate MAU signal). */
export async function touchPilotActivity(
  db: Firestore,
  params: { uid: string; city: string }
): Promise<void> {
  if (!isOpenPilotCity(params.city)) return
  const today = new Date().toISOString().slice(0, 10)
  const key = `${ACTIVE_TOUCH_KEY}_${params.uid}_${today}`
  try {
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
  } catch {
    /* ignore */
  }

  const cityNorm = normalizeCity(params.city)
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  const memberRef = doc(db, 'pilotCohort', pilotCohortDocId(cityNorm), 'members', params.uid)
  try {
    await setDoc(
      memberRef,
      { lastActiveAt: serverTimestamp() },
      { merge: true }
    )
  } catch {
    /* non-fatal */
  }
}

export function attachPilotCohortListener(
  db: Firestore,
  cityNorm: string,
  onData: (doc: PilotCohortDoc | null) => void
): () => void {
  let cancelled = false
  let unsub: (() => void) | null = null

  ;(async () => {
    const { doc, onSnapshot } = await import('firebase/firestore')
    if (cancelled) return
    unsub = onSnapshot(
      doc(db, 'pilotCohort', pilotCohortDocId(cityNorm)),
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
          memberCount: Number(d.memberCount) || 0,
          activeLast7d: Number(d.activeLast7d) || 0,
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

export function pilotCohortProgress(memberCount: number): {
  pct: number
  label: string
  atTarget: boolean
} {
  const pct = Math.min(100, Math.round((memberCount / PILOT_TARGET_MAU_MIN) * 100))
  const atTarget = memberCount >= PILOT_TARGET_MAU_MIN
  const label = atTarget
    ? memberCount >= PILOT_TARGET_MAU_MAX
      ? 'Cupo piloto casi lleno'
      : `${memberCount} en tu ciudad — meta mínima alcanzada`
    : `${memberCount}/${PILOT_TARGET_MAU_MIN} para activar la ciudad`
  return { pct, label, atTarget }
}
