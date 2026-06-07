/**
 * Group chat messages (sessions + squads subcollections) — RT listener with cancelled cleanup.
 */

import type { Firestore } from 'firebase/firestore'
import type { SessionMessage } from '../types'

export function mapGroupMessageDoc(
  docId: string,
  data: Record<string, unknown>
): SessionMessage {
  const ts = Number(data.timestamp)
  return {
    id: docId,
    senderId: String(data.senderId || ''),
    senderName: String(data.senderName || 'Usuario'),
    text: String(data.text || ''),
    timestamp: Number.isFinite(ts) ? ts : Date.now(),
    photo: data.photo as string | undefined,
    voiceUrl: data.voiceUrl as string | undefined,
    voiceDuration: data.voiceDuration as number | undefined,
    reactions: (data.reactions as Record<string, string[]>) || {},
  }
}

/** Merge server snapshot with optimistic client-only messages (temp sm* ids). */
export function mergeGroupMessages(
  server: SessionMessage[],
  prev: SessionMessage[] | undefined
): SessionMessage[] {
  const byId = new Map<string, SessionMessage>()
  for (const m of server) byId.set(m.id, m)

  for (const m of prev || []) {
    if (!m.id.startsWith('sm')) continue
    if (byId.has(m.id)) continue
    const duplicateOnServer = server.some(
      (s) =>
        s.senderId === m.senderId &&
        s.text === m.text &&
        Math.abs((s.timestamp || 0) - (m.timestamp || 0)) < 15000
    )
    if (!duplicateOnServer) byId.set(m.id, m)
  }

  return Array.from(byId.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
}

export interface AttachGroupMessagesListenerOptions {
  onMessages: (msgs: SessionMessage[]) => void
  onError?: (err: unknown) => void
}

export function attachGroupMessagesListener(
  db: Firestore,
  collectionPath: string,
  options: AttachGroupMessagesListenerOptions
): () => void {
  let cancelled = false
  let unsub: (() => void) | null = null

  ;(async () => {
    try {
      const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore')
      if (cancelled) return
      const q = query(collection(db, collectionPath), orderBy('createdAt', 'asc'))
      unsub = onSnapshot(
        q,
        (snapshot) => {
          if (cancelled) return
          const loaded: SessionMessage[] = []
          snapshot.forEach((docSnap) => {
            loaded.push(mapGroupMessageDoc(docSnap.id, docSnap.data() as Record<string, unknown>))
          })
          options.onMessages(loaded)
        },
        (err) => options.onError?.(err)
      )
      if (cancelled) {
        unsub?.()
        unsub = null
      }
    } catch (e) {
      console.warn('[GroupMessages] attach listener setup failed', e)
      options.onError?.(e)
    }
  })()

  return () => {
    cancelled = true
    unsub?.()
  }
}
