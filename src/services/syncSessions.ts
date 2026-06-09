/**
 * EntrenaSync — syncSessions Firestore RT listeners (incoming invite + active session).
 */

import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  type Firestore,
} from 'firebase/firestore'
import { auth } from './firebase'

export interface SyncSessionData {
  participants?: string[]
  startedAt?: number
  endedAt?: number
  actions?: Array<{
    at?: number
    emoji?: string
    label?: string
    userId?: string
    combo?: number
    voiceUrl?: string
    photoUrl?: string
  }>
  vibe?: number
  witnesses?: string[]
  lastWitnessAt?: number
  restUntil?: number | null
  restStartedBy?: string
  participantState?: Record<
    string,
    {
      activeExercise?: string
      pendingReps?: number
      pendingWeightKg?: number
      setCount?: number
      exercises?: import('../types').WorkoutExercise[]
      updatedAt?: number
    }
  >
  workoutLog?: {
    exercises?: import('../types').WorkoutExercise[]
    prs?: Array<{ exercise: string; weightKg: number; reps: number; at: number }>
    updatedAt?: number
  }
}

export interface IncomingSyncPayload {
  sessionId: string
  partnerId: string
  partnerName: string
  startedAt: number
  actions: SyncSessionData['actions']
  vibe?: number
}

const INCOMING_MAX_AGE_MS = 3 * 60 * 60 * 1000
const MAX_AUTH_WAIT_ATTEMPTS = 12

export type SyncActionView = {
  id: string
  emoji: string
  userId: string
  at: number
  label?: string
}

export function normalizeSyncActionsForUi(actions: SyncSessionData['actions']): SyncActionView[] {
  if (!Array.isArray(actions)) return []
  return [...actions]
    .filter((a) => a && typeof a === 'object')
    .sort((a, b) => (b.at || 0) - (a.at || 0))
    .slice(0, 10)
    .map((a, i) => ({
      id: `sa_${a.at || 0}_${i}`,
      emoji: typeof a.emoji === 'string' ? a.emoji : '💪',
      userId: typeof a.userId === 'string' ? a.userId : '',
      at: typeof a.at === 'number' ? a.at : Date.now(),
      label: typeof a.label === 'string' ? a.label : undefined,
    }))
}

/** Firestore rejects undefined field values — never include optional keys when empty. */
export function buildSyncSessionAction(params: {
  emoji: string
  label: string
  userId: string
  at?: number
  combo?: number
  voiceUrl?: string
  photoUrl?: string
}): NonNullable<SyncSessionData['actions']>[number] {
  const action: NonNullable<SyncSessionData['actions']>[number] = {
    emoji: params.emoji,
    label: params.label,
    userId: params.userId,
    at: params.at ?? Date.now(),
  }
  if (params.combo != null && params.combo > 1) action.combo = params.combo
  if (params.voiceUrl) action.voiceUrl = params.voiceUrl
  if (params.photoUrl) action.photoUrl = params.photoUrl
  return action
}

function isPermissionError(err: unknown): boolean {
  const code = (err as { code?: string })?.code
  return code === 'permission-denied' || code === 'PERMISSION_DENIED'
}

async function waitForAuthUid(expectedUid: string): Promise<boolean> {
  for (let attempt = 0; attempt < MAX_AUTH_WAIT_ATTEMPTS; attempt++) {
    const user = auth?.currentUser
    if (user?.uid === expectedUid) {
      try {
        await user.getIdToken()
        return true
      } catch {
        // token refresh failed — retry
      }
    }
    await new Promise((r) => setTimeout(r, 250 * (attempt + 1)))
  }
  return false
}

/** Listen for syncSessions where we are a participant — auto-join incoming EntrenaSync. */
export function attachIncomingSyncListener(
  db: Firestore,
  uid: string,
  handlers: {
    getHasActivePartner: () => boolean
    getTrainingNow: () => boolean
    findPartnerName: (partnerId: string) => string
    onIncoming: (payload: IncomingSyncPayload) => void
    onError?: (err: unknown) => void
  }
): () => void {
  let cancelled = false
  let unsub: (() => void) | null = null
  let retryTimer: ReturnType<typeof setTimeout> | null = null
  let permissionRetries = 0

  const subscribe = () => {
    if (cancelled) return
    try {
      const q = query(collection(db, 'syncSessions'), where('participants', 'array-contains', uid))
      unsub = onSnapshot(
        q,
        (snap) => {
          if (cancelled || handlers.getHasActivePartner()) return
          if (!handlers.getTrainingNow()) return

          for (const docSnap of snap.docs) {
            const data = docSnap.data() as SyncSessionData
            if (data.endedAt) continue
            const started = data.startedAt || 0
            if (Date.now() - started > INCOMING_MAX_AGE_MS) continue

            const otherId = data.participants?.find((p) => p !== uid)
            if (!otherId) continue

            handlers.onIncoming({
              sessionId: docSnap.id,
              partnerId: otherId,
              partnerName: handlers.findPartnerName(otherId),
              startedAt: started || Date.now(),
              actions: normalizeSyncActionsForUi(data.actions),
              vibe: typeof data.vibe === 'number' ? data.vibe : undefined,
            })
            break
          }
        },
        (err) => {
          if (!cancelled && isPermissionError(err) && permissionRetries < 3) {
            permissionRetries += 1
            unsub?.()
            unsub = null
            retryTimer = setTimeout(() => {
              void startListener()
            }, 1500 * permissionRetries)
            return
          }
          console.warn('incoming syncSessions listener error:', err)
          handlers.onError?.(err)
        }
      )
    } catch (err) {
      console.warn('incoming syncSessions listener setup failed:', err)
      handlers.onError?.(err)
    }
  }

  const startListener = async () => {
    if (cancelled) return
    const ready = await waitForAuthUid(uid)
    if (cancelled || !ready) return
    subscribe()
  }

  void startListener()

  return () => {
    cancelled = true
    if (retryTimer) clearTimeout(retryTimer)
    unsub?.()
  }
}

/** Listen to the stable pair doc for live actions / vibe while EntrenaSync is active. */
export function attachActiveSyncSessionListener(
  db: Firestore,
  sessionId: string,
  myUid: string,
  handlers: {
    onUpdate: (data: SyncSessionData) => void
    onPartnerAction?: (action: NonNullable<SyncSessionData['actions']>[number]) => void
    onError?: (err: unknown) => void
  }
): () => void {
  let cancelled = false
  let unsub: (() => void) | null = null
  let retryTimer: ReturnType<typeof setTimeout> | null = null
  let permissionRetries = 0

  const subscribe = () => {
    if (cancelled) return
    try {
      const sessionRef = doc(db, 'syncSessions', sessionId)
      unsub = onSnapshot(
        sessionRef,
        (snap) => {
          if (cancelled || !snap.exists()) return
          const data = snap.data() as SyncSessionData
          handlers.onUpdate(data)

          const recent = normalizeSyncActionsForUi(data.actions)
          const latest = recent[0]
          if (latest && latest.userId && latest.userId !== myUid) {
            handlers.onPartnerAction?.(latest)
          }
        },
        (err) => {
          if (!cancelled && isPermissionError(err) && permissionRetries < 3) {
            permissionRetries += 1
            unsub?.()
            unsub = null
            retryTimer = setTimeout(() => {
              void startListener()
            }, 1500 * permissionRetries)
            return
          }
          console.warn('syncSessions onSnapshot error (non-fatal, fallback to mirror):', err)
          handlers.onError?.(err)
        }
      )
    } catch (err) {
      console.warn('active syncSessions listener setup failed:', err)
      handlers.onError?.(err)
    }
  }

  const startListener = async () => {
    if (cancelled) return
    const ready = await waitForAuthUid(myUid)
    if (cancelled || !ready) return
    subscribe()
  }

  void startListener()

  return () => {
    cancelled = true
    if (retryTimer) clearTimeout(retryTimer)
    unsub?.()
  }
}

export function buildSyncSessionId(uidA: string, uidB: string): string {
  const [a, b] = [uidA, uidB].sort()
  return `sync_${a}_${b}`
}
