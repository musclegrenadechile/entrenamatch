/**
 * Training sessions — Firestore fetch + RT listener (newest first).
 */

import type { Firestore } from 'firebase/firestore'
import type { TrainingSession } from '../types'

export function mapSessionDoc(id: string, data: Record<string, unknown>): TrainingSession | null {
  if (!data?.title) return null
  const createdAtRaw = data.createdAt as { toMillis?: () => number } | number | undefined
  const lastAtRaw = data.lastMessageAt as { toMillis?: () => number } | number | undefined
  return {
    id,
    creatorId: String(data.creatorId || ''),
    creatorName: String(data.creatorName || 'Usuario'),
    title: String(data.title),
    description: String(data.description || ''),
    time: String(data.time || ''),
    location: String(data.location || ''),
    trainingType: String(data.trainingType || ''),
    maxParticipants: Number(data.maxParticipants) || 4,
    participants: Array.isArray(data.participants) ? (data.participants as string[]) : [],
    createdAt:
      typeof createdAtRaw === 'object' && createdAtRaw?.toMillis
        ? createdAtRaw.toMillis()
        : (typeof createdAtRaw === 'number' ? createdAtRaw : Date.now()),
    lastMessagePreview: data.lastMessagePreview as string | undefined,
    lastMessageAt:
      typeof lastAtRaw === 'object' && lastAtRaw?.toMillis
        ? lastAtRaw.toMillis()
        : (typeof lastAtRaw === 'number' ? lastAtRaw : undefined),
  }
}

export async function fetchTrainingSessions(db: Firestore, limitN = 50): Promise<TrainingSession[]> {
  const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore')
  const q = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'), limit(limitN))
  const snapshot = await getDocs(q)
  const loaded: TrainingSession[] = []
  snapshot.forEach((docSnap) => {
    const mapped = mapSessionDoc(docSnap.id, docSnap.data() as Record<string, unknown>)
    if (mapped) loaded.push(mapped)
  })
  return loaded
}

/** Real-time sessions list (cancelled-safe pattern). */
export function attachSessionsListener(
  db: Firestore,
  onSessions: (sessions: TrainingSession[]) => void,
  opts?: { limit?: number; onError?: (err: unknown) => void }
): () => void {
  let cancelled = false
  let unsub: (() => void) | null = null

  ;(async () => {
    const { collection, query, orderBy, limit, onSnapshot } = await import('firebase/firestore')
    if (cancelled) return
    const q = query(
      collection(db, 'sessions'),
      orderBy('createdAt', 'desc'),
      limit(opts?.limit ?? 50)
    )
    unsub = onSnapshot(
      q,
      (snapshot) => {
        if (cancelled) return
        const loaded: TrainingSession[] = []
        snapshot.forEach((docSnap) => {
          const mapped = mapSessionDoc(docSnap.id, docSnap.data() as Record<string, unknown>)
          if (mapped) loaded.push(mapped)
        })
        onSessions(loaded)
      },
      (err) => {
        console.warn('[sessions] listener error', err)
        opts?.onError?.(err)
      }
    )
  })()

  return () => {
    cancelled = true
    unsub?.()
  }
}
