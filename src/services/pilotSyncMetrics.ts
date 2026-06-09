/**
 * Pilot metrics — real EntrenaSync sessions per week / city (Fase 100).
 * Path: pilotSyncSessions/{sessionId}
 * Aggregate: pilotWeeklyMetrics/{cityNorm__weekKey}
 */

import type { Firestore } from 'firebase/firestore'
import { normalizeCity } from './localNetwork'
import { getWeekKey } from '../utils/weekLiveTracker'

/** Cities in the Viña / Santiago pilot. */
export const PILOT_CITY_NORMS = [
  'vina del mar',
  'santiago',
  'valparaiso',
  'concon',
] as const

export type PilotCityNorm = (typeof PILOT_CITY_NORMS)[number]

export const MIN_PILOT_SYNC_MINUTES = 2

export type PilotSyncSessionDoc = {
  sessionId: string
  weekKey: string
  participants: [string, string]
  recordedBy: string
  cityNorm: string
  cityLabel: string
  partnerCityNorm: string | null
  partnerCityLabel: string | null
  durationMin: number
  endedAt: number
}

export type PilotWeeklyMetricsDoc = {
  cityNorm: string
  cityLabel: string
  weekKey: string
  realSyncCount: number
  totalSyncMinutes: number
  lastSyncAt: number
}

export function pilotWeeklyDocId(cityNorm: string, weekKey: string): string {
  const raw = `${cityNorm}__${weekKey}`.replace(/[^a-z0-9_-]/g, '_')
  return raw.slice(0, 120) || 'unknown'
}

export function isRealFirebaseUid(uid: string): boolean {
  if (!uid || uid.length < 20) return false
  return !/^p\d+$/i.test(uid)
}

export function isPilotCityNorm(cityNorm: string): boolean {
  return (PILOT_CITY_NORMS as readonly string[]).includes(cityNorm)
}

export function resolvePilotCityForSync(
  selfCity?: string | null,
  partnerCity?: string | null
): { cityNorm: string; cityLabel: string } | null {
  const selfNorm = normalizeCity(selfCity)
  const partnerNorm = normalizeCity(partnerCity)
  if (isPilotCityNorm(selfNorm)) {
    return { cityNorm: selfNorm, cityLabel: selfCity?.trim() || selfNorm }
  }
  if (isPilotCityNorm(partnerNorm)) {
    return { cityNorm: partnerNorm, cityLabel: partnerCity?.trim() || partnerNorm }
  }
  return null
}

export type PilotSyncRecordInput = {
  sessionId: string
  weekKey?: string
  participantIds: [string, string]
  recorderUid: string
  selfCity?: string | null
  partnerCity?: string | null
  durationMin: number
  endedAt?: number
}

export function validatePilotSyncRecord(input: PilotSyncRecordInput): string | null {
  const [a, b] = input.participantIds
  if (!a || !b || a === b) return 'need_two_distinct_participants'
  if (!isRealFirebaseUid(a) || !isRealFirebaseUid(b)) return 'demo_or_invalid_uid'
  if (!isRealFirebaseUid(input.recorderUid)) return 'invalid_recorder'
  if (!input.participantIds.includes(input.recorderUid)) return 'recorder_not_participant'
  if (input.durationMin < MIN_PILOT_SYNC_MINUTES) return 'duration_too_short'
  if (input.durationMin > 480) return 'duration_too_long'
  if (!input.sessionId?.startsWith('sync_')) return 'invalid_session_id'
  if (!resolvePilotCityForSync(input.selfCity, input.partnerCity)) return 'not_pilot_city'
  return null
}

export async function recordPilotSyncSession(
  db: Firestore,
  input: PilotSyncRecordInput
): Promise<{ recorded: boolean; reason?: string }> {
  const err = validatePilotSyncRecord(input)
  if (err) return { recorded: false, reason: err }

  const pilot = resolvePilotCityForSync(input.selfCity, input.partnerCity)!
  const weekKey = input.weekKey || getWeekKey()
  const endedAt = input.endedAt ?? Date.now()
  const participants = [...input.participantIds].sort() as [string, string]
  const partnerCityNorm = normalizeCity(input.partnerCity) || null

  const { doc, runTransaction, serverTimestamp, increment } = await import('firebase/firestore')
  const sessionRef = doc(db, 'pilotSyncSessions', input.sessionId)
  const metricsRef = doc(db, 'pilotWeeklyMetrics', pilotWeeklyDocId(pilot.cityNorm, weekKey))

  try {
    await runTransaction(db, async (tx) => {
      const existing = await tx.get(sessionRef)
      if (existing.exists()) return

      const session: PilotSyncSessionDoc = {
        sessionId: input.sessionId,
        weekKey,
        participants,
        recordedBy: input.recorderUid,
        cityNorm: pilot.cityNorm,
        cityLabel: pilot.cityLabel,
        partnerCityNorm,
        partnerCityLabel: input.partnerCity?.trim() || null,
        durationMin: input.durationMin,
        endedAt,
      }
      tx.set(sessionRef, { ...session, createdAt: serverTimestamp() })

      const metricsSnap = await tx.get(metricsRef)
      if (metricsSnap.exists()) {
        tx.update(metricsRef, {
          realSyncCount: increment(1),
          totalSyncMinutes: increment(input.durationMin),
          lastSyncAt: endedAt,
          updatedAt: serverTimestamp(),
        })
      } else {
        tx.set(metricsRef, {
          cityNorm: pilot.cityNorm,
          cityLabel: pilot.cityLabel,
          weekKey,
          realSyncCount: 1,
          totalSyncMinutes: input.durationMin,
          lastSyncAt: endedAt,
          updatedAt: serverTimestamp(),
        })
      }
    })
    return { recorded: true }
  } catch (e) {
    console.warn('[pilotSyncMetrics] record failed', e)
    return { recorded: false, reason: 'firestore_error' }
  }
}

/** Sum real sync counts across pilot cities for a week (client-side rollup). */
export function sumPilotWeeklyMetrics(
  docs: PilotWeeklyMetricsDoc[],
  weekKey: string
): { totalSyncs: number; totalMinutes: number; byCity: Array<{ city: string; syncs: number; minutes: number }> } {
  const filtered = docs.filter((d) => d.weekKey === weekKey)
  const byCity = filtered.map((d) => ({
    city: d.cityLabel || d.cityNorm,
    syncs: d.realSyncCount,
    minutes: d.totalSyncMinutes,
  }))
  return {
    totalSyncs: filtered.reduce((s, d) => s + d.realSyncCount, 0),
    totalMinutes: filtered.reduce((s, d) => s + d.totalSyncMinutes, 0),
    byCity,
  }
}
