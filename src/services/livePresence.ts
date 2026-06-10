/**
 * GymPulse live presence — dedicated collection for real-time cross-user visibility.
 * Path: livePresence/{userId}
 *
 * SOURCE OF TRUTH (fase 126 / oleada 4):
 * - Map pins and cross-user live list: livePresence collection ONLY when listener is healthy
 * - profiles.trainingNow: deck/feed filters + fallback if livePresence listener errors
 * - Never merge both sources when presence is healthy (prevents duplicate pins)
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
import { applyGhostModeIfEnabled } from '../utils/ghostMode'

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
  ghostMode?: boolean
  liveMotionScore?: number
  liveMotionAt?: number
  liveMotionIdle?: boolean
  liveActivityState?: 'active' | 'idle' | 'unknown'
  verificationStatus?: 'unverified' | 'pending' | 'verified'
  spotifyShareLive?: boolean
  spotifyNowPlaying?: Record<string, unknown> | null
  gymSoundAnthem?: Record<string, unknown> | null
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
  const rawLat = Number.isFinite(Number(user.lat))
    ? Number(user.lat)
    : (loc?.lat != null ? Number(loc.lat) : -33.02)
  const rawLng = Number.isFinite(Number(user.lng))
    ? Number(user.lng)
    : (loc?.lng != null ? Number(loc.lng) : -71.55)
  const { lat, lng, ghostMode: fuzzy } = applyGhostModeIfEnabled(
    rawLat,
    rawLng,
    !!user.ghostMode,
    userId
  )
  return {
    userId,
    name: user.name || 'Usuario',
    age: user.age,
    gender: user.gender,
    city: user.city,
    country: user.country,
    lat,
    lng,
    ghostMode: fuzzy,
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
    liveMotionScore: user.liveMotionScore,
    liveMotionAt: user.liveMotionAt,
    liveMotionIdle: user.liveMotionIdle,
    liveActivityState: user.liveActivityState,
    verificationStatus: user.verificationStatus,
    spotifyShareLive: user.spotifyShareLive === true,
    spotifyNowPlaying:
      user.spotifyShareLive && user.spotifyNowPlaying ? user.spotifyNowPlaying : null,
    gymSoundAnthem:
      user.spotifyShareLive && user.gymSoundAnthem ? user.gymSoundAnthem : null,
  }
}

/** Patch GymSound fields on livePresence while user stays LIVE (map + sheet). */
export async function patchLivePresenceGymSound(
  db: Firestore,
  userId: string,
  gymSound: Pick<
    LivePresenceWritePayload,
    'spotifyShareLive' | 'spotifyNowPlaying' | 'gymSoundAnthem'
  >,
  sanitize: (obj: unknown) => unknown
): Promise<void> {
  const ref = doc(db, 'livePresence', userId)
  await setDoc(
    ref,
    sanitize({
      ...gymSound,
      updatedAt: serverTimestamp(),
    }),
    { merge: true }
  )
}

/** Lightweight motion-only patch while staying LIVE (fase B). */
export async function patchLivePresenceMotion(
  db: Firestore,
  userId: string,
  motion: Pick<
    LivePresenceWritePayload,
    'liveMotionScore' | 'liveMotionAt' | 'liveMotionIdle' | 'liveActivityState'
  >,
  sanitize: (obj: unknown) => unknown
): Promise<void> {
  const ref = doc(db, 'livePresence', userId)
  await setDoc(
    ref,
    sanitize({
      ...motion,
      updatedAt: serverTimestamp(),
    }),
    { merge: true }
  )
}
