/**
 * GymPulse live presence — dedicated collection for real-time cross-user visibility.
 * Path: livePresence/{userId}
 *
 * Why a separate collection?
 * - Smaller, always-live query (no boolean field drift on profiles)
 * - Instant onSnapshot for all clients when anyone toggles live
 * - profiles.trainingNow stays in sync for feed/deck filters
 */

import type { Firestore } from 'firebase/firestore'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { profileDocToLiveUser, type LiveUserLike } from '../utils/gymPulseLive'

export type LivePresenceHandler = (users: LiveUserLike[]) => void

export interface LivePresenceWritePayload {
  userId: string
  name: string
  age?: number
  gender?: string
  city?: string
  country?: string
  lat?: number
  lng?: number
  bio?: string
  photos?: string[]
  trainingTypes?: string[]
  goals?: string[]
  level?: string
  trainingNowSince: number
  liveStreak?: number
  liveJoins?: number
  trainingSyncWith?: string | null
  retentionLevel?: number
  gymCheckIn?: {
    gymId: string
    gymName: string
    lat: number
    lng: number
    checkedInAt: number
  } | null
}

/** Write / refresh presence doc when user goes live. */
export async function writeLivePresence(
  db: Firestore,
  payload: LivePresenceWritePayload,
  sanitize: (obj: unknown) => unknown
): Promise<void> {
  const ref = doc(db, 'livePresence', payload.userId)
  await setDoc(
    ref,
    sanitize({
      ...payload,
      trainingNow: true,
      updatedAt: serverTimestamp(),
    }),
    { merge: true }
  )
}

/** Remove presence doc when user stops live. */
export async function clearLivePresence(db: Firestore, userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'livePresence', userId))
  } catch (e) {
    console.warn('[LivePresence] clear failed (may already be gone)', e)
  }
}

/** Real-time listener — every doc in livePresence is a live user. */
export function attachLivePresenceListener(
  db: Firestore,
  onUpdate: LivePresenceHandler,
  options: {
    getBlockedIds?: () => string[]
    onError?: (err: unknown) => void
  } = {}
): Unsubscribe {
  const { getBlockedIds, onError } = options
  return onSnapshot(
    collection(db, 'livePresence'),
    (snapshot) => {
      const blocked = new Set(getBlockedIds?.() || [])
      const live: LiveUserLike[] = []
      snapshot.forEach((docSnap) => {
        if (blocked.has(docSnap.id)) return
        const data = docSnap.data() as Record<string, unknown>
        live.push(profileDocToLiveUser(docSnap.id, { ...data, trainingNow: true }))
      })
      onUpdate(live)
    },
    (err) => {
      console.warn('[LivePresence] listener error', err)
      onError?.(err)
    }
  )
}

/** Build presence payload from app user profile. */
export function buildLivePresencePayload(
  userId: string,
  user: Record<string, any>,
  loc?: { lat: number; lng: number } | null
): LivePresenceWritePayload {
  const lat = Number.isFinite(Number(user.lat))
    ? Number(user.lat)
    : (loc?.lat != null ? Number(loc.lat) : -33.02)
  const lng = Number.isFinite(Number(user.lng))
    ? Number(user.lng)
    : (loc?.lng != null ? Number(loc.lng) : -71.55)
  return {
    userId,
    name: user.name || 'Usuario',
    age: user.age,
    gender: user.gender,
    city: user.city,
    country: user.country,
    lat,
    lng,
    bio: user.bio,
    photos: user.photos,
    trainingTypes: user.trainingTypes,
    goals: user.goals,
    level: user.level,
    trainingNowSince: user.trainingNowSince ?? Date.now(),
    liveStreak: user.liveStreak,
    liveJoins: user.liveJoins,
    trainingSyncWith: user.trainingSyncWith ?? null,
    retentionLevel: user.retentionLevel,
    gymCheckIn: user.gymCheckIn ?? null,
  }
}
