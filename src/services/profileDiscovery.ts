/**
 * Profile discovery helpers — load partners by UID (matches/chats) even when
 * they fall outside the global updatedAt snapshot.
 */

import type { Firestore } from 'firebase/firestore'
import type { Profile } from '../types'
import { isDeletedProfileData } from '../utils/deletedProfile'
import { normalizeTrainingSince } from '../utils/gymPulseLive'

export function mapFirestoreProfileDoc(
  id: string,
  data: Record<string, unknown> | null | undefined
): Profile | null {
  if (!data || !data.name || isDeletedProfileData(data)) return null
  const d = data as Record<string, any>
  return {
    id,
    name: d.name,
    age: d.age || 25,
    gender: d.gender || 'hombre',
    city: d.city || '',
    country: d.country || 'Chile',
    lat: d.lat || -33.0,
    lng: d.lng || -71.0,
    bio: d.bio || '',
    photos: d.photos || [],
    trainingTypes: d.trainingTypes || [],
    goals: d.goals || [],
    level: d.level || 'Intermedio',
    availability: d.availability || ['Tarde'],
    intensity: d.intensity,
    verificationStatus: d.verificationStatus,
    verificationDate: d.verificationDate ?? undefined,
    trainingNow: d.trainingNow || false,
    trainingNowSince: normalizeTrainingSince(d.trainingNowSince),
    liveStreak: d.liveStreak != null ? d.liveStreak : undefined,
    lastLiveDate: d.lastLiveDate != null ? d.lastLiveDate : undefined,
    liveJoins: d.liveJoins != null ? d.liveJoins : undefined,
    joinedLiveStreak: d.joinedLiveStreak != null ? d.joinedLiveStreak : undefined,
    dailyTrainingStreak: d.dailyTrainingStreak != null ? d.dailyTrainingStreak : undefined,
    dailySynergyStreak: d.dailySynergyStreak != null ? d.dailySynergyStreak : undefined,
    dailyVoiceStreak: d.dailyVoiceStreak != null ? d.dailyVoiceStreak : undefined,
    dailyPulseStreak: d.dailyPulseStreak != null ? d.dailyPulseStreak : undefined,
    momentumPoints: d.momentumPoints != null ? d.momentumPoints : undefined,
    lastDailyPulseDate: d.lastDailyPulseDate != null ? d.lastDailyPulseDate : undefined,
    streakProtectedDate: d.streakProtectedDate || null,
    pulseAmplifiedDate: d.pulseAmplifiedDate || null,
    currentDailyChallenge: d.currentDailyChallenge || undefined,
    retentionLevel: d.retentionLevel || 1,
    retentionXp: d.retentionXp || 0,
    trainingSyncWith: d.trainingSyncWith || undefined,
    syncStreak: d.syncStreak != null ? d.syncStreak : undefined,
    syncBonds: d.syncBonds || {},
    weekStats: d.weekStats || undefined,
    showOnLeaderboard: d.showOnLeaderboard,
    gymCheckIn: d.gymCheckIn || undefined,
    isBetaBot: d.isBetaBot === true,
    communityAdmin: d.communityAdmin === true,
    accountStatus: d.accountStatus === 'deleted' ? 'deleted' : undefined,
  }
}

export async function fetchProfilesByIds(
  db: Firestore,
  ids: string[],
  opts?: { excludeUid?: string | null }
): Promise<Profile[]> {
  const unique = [...new Set(ids.filter((id) => id && id !== opts?.excludeUid))]
  if (unique.length === 0) return []

  const { doc, getDoc } = await import('firebase/firestore')
  const snaps = await Promise.all(
    unique.map(async (id) => {
      try {
        const snap = await getDoc(doc(db, 'profiles', id))
        if (!snap.exists()) return null
        return mapFirestoreProfileDoc(snap.id, snap.data() as Record<string, unknown>)
      } catch {
        return null
      }
    })
  )
  return snaps.filter((p): p is Profile => !!p)
}

/** Merge incoming profiles into an existing list (incoming wins on field conflicts). */
export function mergeProfileLists(existing: Profile[], incoming: Profile[]): Profile[] {
  if (incoming.length === 0) return existing
  const byId = new Map(existing.map((p) => [p.id, p]))
  for (const p of incoming) {
    const prev = byId.get(p.id)
    byId.set(p.id, prev ? { ...prev, ...p } : p)
  }
  return Array.from(byId.values())
}
