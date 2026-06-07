/**
 * Real-time GymPulse live users — Firestore onSnapshot on profiles where trainingNow==true.
 */

import type { Firestore } from 'firebase/firestore'
import {
  collection,
  onSnapshot,
  query,
  where,
  limit,
  type Unsubscribe,
} from 'firebase/firestore'
import { profileDocToLiveUser, type LiveUserLike } from '../utils/gymPulseLive'

export type LiveUsersSnapshotHandler = (users: LiveUserLike[]) => void

export interface AttachLiveUsersListenerOptions {
  /** Max profiles in live query (Firestore limit) */
  maxResults?: number
  /** Dynamic blocked-user filter (fresh on each snapshot) */
  getBlockedIds?: () => string[]
  onError?: (err: unknown) => void
}

/**
 * Subscribe to all profiles with trainingNow === true.
 * Returns unsubscribe synchronously once onSnapshot is registered.
 */
export function attachLiveUsersListener(
  db: Firestore,
  onUpdate: LiveUsersSnapshotHandler,
  options: AttachLiveUsersListenerOptions = {}
): Unsubscribe {
  const { maxResults = 150, getBlockedIds, onError } = options
  const q = query(
    collection(db, 'profiles'),
    where('trainingNow', '==', true),
    limit(maxResults)
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const blocked = new Set(getBlockedIds?.() || [])
      const live: LiveUserLike[] = []
      snapshot.forEach((docSnap) => {
        if (blocked.has(docSnap.id)) return
        const data = docSnap.data() as Record<string, unknown>
        // Strict boolean — ignore string/truthy legacy values that break queries on write
        if (data.trainingNow !== true) return
        live.push(profileDocToLiveUser(docSnap.id, data, { forceLive: true }))
      })
      onUpdate(live)
    },
    (err) => {
      console.warn('[LiveUsers] dedicated listener error', err)
      onError?.(err)
    }
  )
}

/** Patch realProfiles array with live flags from dedicated snapshot (bidirectional UI sync). */
export function patchRealProfilesWithLiveSnapshot(
  prev: LiveUserLike[],
  liveUsers: LiveUserLike[],
  opts: { selfUid?: string | null } = {}
): LiveUserLike[] {
  const liveById = new Map(liveUsers.map((u) => [u.id, u]))
  const liveIds = new Set(liveUsers.map((u) => u.id))
  const byId = new Map(prev.map((p) => [p.id, p]))
  let changed = false

  for (const live of liveUsers) {
    const existing = byId.get(live.id)
    if (existing) {
      const next = {
        ...existing,
        ...live,
        trainingNow: true,
        trainingNowSince: live.trainingNowSince ?? existing.trainingNowSince,
        lat: live.lat ?? existing.lat,
        lng: live.lng ?? existing.lng,
      }
      if (
        !existing.trainingNow ||
        existing.trainingNowSince !== next.trainingNowSince ||
        existing.lat !== next.lat ||
        existing.lng !== next.lng
      ) {
        byId.set(live.id, next)
        changed = true
      }
    } else {
      byId.set(live.id, { ...live, trainingNow: true })
      changed = true
    }
  }

  for (const [id, p] of byId) {
    if (id === opts.selfUid) continue
    if (p.trainingNow && !liveIds.has(id)) {
      byId.set(id, { ...p, trainingNow: false, trainingNowSince: undefined })
      changed = true
    }
  }

  return changed ? Array.from(byId.values()) : prev
}
