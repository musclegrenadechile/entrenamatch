/**
 * Aggregated weekly city challenge stats (Phase 4).
 * Path: cityWeeklyStats/{cityNorm__weekKey}
 * Sub: contributors/{uid} — used for milestone push targets.
 */

import type { Firestore } from 'firebase/firestore'
import { WEEKLY_CITY_CHALLENGE_TARGET_MINUTES } from './localNetwork'

export type CityWeeklyStatsDoc = {
  cityNorm: string
  cityLabel: string
  weekKey: string
  totalMinutes: number
  participantCount?: number
  completedAt?: number | null
}

export function cityStatsDocId(cityNorm: string, weekKey: string): string {
  const raw = `${cityNorm}__${weekKey}`.replace(/[^a-z0-9_-]/g, '_')
  return raw.slice(0, 120) || 'unknown'
}

export async function bumpCityWeeklyStats(
  db: Firestore,
  params: {
    cityNorm: string
    cityLabel: string
    weekKey: string
    uid: string
    liveMinutesDelta: number
    syncMinutesDelta: number
  }
): Promise<void> {
  const totalDelta = params.liveMinutesDelta + params.syncMinutesDelta
  if (!params.cityNorm || !params.uid || totalDelta <= 0) return

  const { doc, setDoc, getDoc, increment, serverTimestamp } = await import(
    'firebase/firestore'
  )
  const docId = cityStatsDocId(params.cityNorm, params.weekKey)
  const statsRef = doc(db, 'cityWeeklyStats', docId)
  const contribRef = doc(db, 'cityWeeklyStats', docId, 'contributors', params.uid)

  const contribSnap = await getDoc(contribRef)
  const isNewContributor = !contribSnap.exists()

  await setDoc(
    statsRef,
    {
      cityNorm: params.cityNorm,
      cityLabel: params.cityLabel,
      weekKey: params.weekKey,
      targetMinutes: WEEKLY_CITY_CHALLENGE_TARGET_MINUTES,
      totalMinutes: increment(totalDelta),
      ...(isNewContributor ? { participantCount: increment(1) } : {}),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  await setDoc(
    contribRef,
    {
      uid: params.uid,
      lastContributionAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export function attachCityWeeklyStatsListener(
  db: Firestore,
  docId: string,
  onStats: (stats: CityWeeklyStatsDoc | null) => void
): () => void {
  let cancelled = false
  let unsub: (() => void) | null = null

  ;(async () => {
    const { doc, onSnapshot } = await import('firebase/firestore')
    if (cancelled) return
    unsub = onSnapshot(
      doc(db, 'cityWeeklyStats', docId),
      (snap) => {
        if (cancelled) return
        if (!snap.exists()) {
          onStats(null)
          return
        }
        const d = snap.data() as Record<string, unknown>
        onStats({
          cityNorm: String(d.cityNorm || ''),
          cityLabel: String(d.cityLabel || ''),
          weekKey: String(d.weekKey || ''),
          totalMinutes: Number(d.totalMinutes) || 0,
          participantCount: d.participantCount != null ? Number(d.participantCount) : undefined,
          completedAt: d.completedAt != null ? Number(d.completedAt) : null,
        })
      },
      (err) => {
        console.warn('[cityWeeklyStats] listener error', err)
        if (!cancelled) onStats(null)
      }
    )
  })()

  return () => {
    cancelled = true
    unsub?.()
  }
}

export function mergeCityChallengeWithFirestore(
  clientChallenge: import('./localNetwork').CityChallenge | null,
  firestore: CityWeeklyStatsDoc | null
): import('./localNetwork').CityChallenge | null {
  if (!clientChallenge && !firestore) return null
  const target =
    clientChallenge?.targetMinutes ?? WEEKLY_CITY_CHALLENGE_TARGET_MINUTES
  const fsMinutes = firestore?.totalMinutes ?? 0
  const clientMinutes = clientChallenge?.currentMinutes ?? 0
  const currentMinutes = Math.max(fsMinutes, clientMinutes)
  const participants = Math.max(
    firestore?.participantCount ?? 0,
    clientChallenge?.participants ?? 0
  )
  const cityLabel =
    firestore?.cityLabel || clientChallenge?.cityLabel || ''
  const weekKey = firestore?.weekKey || clientChallenge?.weekKey || ''
  if (!cityLabel && currentMinutes === 0) return clientChallenge

  return {
    cityLabel,
    targetMinutes: target,
    currentMinutes,
    participants,
    weekKey,
    progressPct: Math.min(100, Math.round((currentMinutes / target) * 100)),
  }
}
