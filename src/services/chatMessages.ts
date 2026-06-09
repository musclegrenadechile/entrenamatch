/**
 * 1:1 direct chat — Firestore RT listener with cancelled-flag cleanup (postComments pattern).
 */

import type { Firestore } from 'firebase/firestore'

export type DirectChatSendStatus = 'sending' | 'sent' | 'failed'

export interface DirectChatMsg {
  id: string
  from: 'me' | 'them'
  text: string
  timestamp: number
  voiceUrl?: string
  voiceDuration?: number
  read?: boolean
  readAt?: number
  /** Client-generated id written to Firestore for fast optimistic ↔ server matching */
  clientId?: string
  /** Local-only until Firestore ack */
  sendStatus?: DirectChatSendStatus
}

export function docToDirectChatMsg(
  docSnap: { id: string; data: () => Record<string, unknown> },
  myUid: string
): DirectChatMsg {
  const data = docSnap.data()
  const ts = Number(data.timestamp)
  const readAt = Number(data.readAt)
  return {
    id: docSnap.id,
    from: data.from === myUid ? 'me' : 'them',
    text: String(data.text || ''),
    timestamp: Number.isFinite(ts) ? ts : Date.now(),
    voiceUrl: data.voiceUrl as string | undefined,
    voiceDuration: data.voiceDuration as number | undefined,
    read: data.read === true,
    readAt: Number.isFinite(readAt) ? readAt : undefined,
    clientId: typeof data.clientId === 'string' ? data.clientId : undefined,
    sendStatus: 'sent',
  }
}

export function mergeDirectChatMessages(a: DirectChatMsg[], b: DirectChatMsg[]): DirectChatMsg[] {
  const byId = new Map<string, DirectChatMsg>()
  for (const m of [...a, ...b]) byId.set(m.id, m)
  return applyReadReceiptInference(Array.from(byId.values())).sort(
    (x, y) => x.timestamp - y.timestamp
  )
}

/**
 * When the partner replied after your message, treat it as read even if Firestore
 * readAt was not persisted (legacy messages or failed mark-on-open).
 */
export function applyReadReceiptInference(msgs: DirectChatMsg[]): DirectChatMsg[] {
  const incoming = msgs.filter((m) => m.from === 'them')
  if (incoming.length === 0) return msgs

  const latestIncomingTs = Math.max(...incoming.map((m) => m.timestamp || 0))

  return msgs.map((m) => {
    if (m.from !== 'me' || m.read || m.readAt) return m
    const ts = m.timestamp || 0
    const replyAfter = incoming.find((t) => (t.timestamp || 0) > ts)
    if (replyAfter) {
      return { ...m, read: true, readAt: replyAfter.timestamp }
    }
    if (ts <= latestIncomingTs && latestIncomingTs > 0) {
      return { ...m, read: true, readAt: latestIncomingTs }
    }
    return m
  })
}

/** Keep in-flight optimistic sends until Firestore confirms the same text/timestamp. */
export function dedupeWithOptimistic(
  serverMsgs: DirectChatMsg[],
  localMsgs: Array<{
    id: string
    from: string
    text?: string
    timestamp?: number
    voiceUrl?: string
    voiceDuration?: number
    clientId?: string
    sendStatus?: DirectChatSendStatus
    read?: boolean
    readAt?: number
  }>
): DirectChatMsg[] {
  const serverIds = new Set(serverMsgs.map((m) => m.id))
  const serverClientIds = new Set(
    serverMsgs.map((m) => m.clientId).filter((id): id is string => !!id)
  )
  const pendingOptimistic = localMsgs
    .filter((m) => m.from === 'me' && !serverIds.has(m.id))
    .filter((m) => {
      const cid = (m as { clientId?: string }).clientId || m.id
      if (serverClientIds.has(cid)) return false
      const ts = m.timestamp || 0
      const text = String(m.text || '')
      return !serverMsgs.some(
        (s) =>
          s.from === 'me' &&
          s.text === text &&
          Math.abs(s.timestamp - ts) < 20000
      )
    })
    .map((m) => ({
      id: m.id,
      from: 'me' as const,
      text: String(m.text || ''),
      timestamp: m.timestamp || Date.now(),
      voiceUrl: m.voiceUrl,
      voiceDuration: m.voiceDuration,
      clientId: (m as { clientId?: string }).clientId || m.id,
      sendStatus: (m as { sendStatus?: DirectChatSendStatus }).sendStatus || 'sending',
      read: m.read,
      readAt: m.readAt,
    }))
  return mergeDirectChatMessages(serverMsgs, pendingOptimistic)
}

export interface AttachDirectChatListenerOptions {
  onMessages: (msgs: DirectChatMsg[]) => void
  /** Fired for new incoming messages after initial snapshot population */
  onIncoming?: (msg: DirectChatMsg) => void
  onError?: (err: unknown) => void
}

/** One listener pair (outgoing + incoming queries) per chat thread. */
export function attachDirectChatListener(
  db: Firestore,
  myUid: string,
  otherUid: string,
  options: AttachDirectChatListenerOptions
): () => void {
  let cancelled = false
  let unsub1: (() => void) | null = null
  let unsub2: (() => void) | null = null
  let msgsOut: DirectChatMsg[] = []
  let msgsIn: DirectChatMsg[] = []
  const seenIncomingIds = new Set<string>()
  let incomingInitialized = false

  const emit = () => {
    if (cancelled) return
    options.onMessages(mergeDirectChatMessages(msgsOut, msgsIn))
  }

  ;(async () => {
    try {
      const { collection, query, where, onSnapshot } = await import('firebase/firestore')
      const messagesRef = collection(db, 'messages')
      const qOut = query(messagesRef, where('from', '==', myUid), where('to', '==', otherUid))
      const qIn = query(messagesRef, where('from', '==', otherUid), where('to', '==', myUid))

      unsub1 = onSnapshot(
        qOut,
        (snap) => {
          if (cancelled) return
          msgsOut = snap.docs.map((d) => docToDirectChatMsg(d, myUid))
          emit()
        },
        (err) => options.onError?.(err)
      )

      unsub2 = onSnapshot(
        qIn,
        (snap) => {
          if (cancelled) return
          const changes = snap.docChanges()
          msgsIn = snap.docs.map((d) => docToDirectChatMsg(d, myUid))

          if (incomingInitialized && options.onIncoming) {
            for (const ch of changes) {
              if (ch.type !== 'added') continue
              const msgId = ch.doc.id
              if (seenIncomingIds.has(msgId)) continue
              const msg = docToDirectChatMsg(ch.doc, myUid)
              if (msg.from === 'them') options.onIncoming!(msg)
            }
          }

          for (const d of snap.docs) seenIncomingIds.add(d.id)
          if (!incomingInitialized) incomingInitialized = true
          emit()
        },
        (err) => options.onError?.(err)
      )

      if (cancelled) {
        unsub1?.()
        unsub2?.()
        unsub1 = null
        unsub2 = null
      }
    } catch (e) {
      console.warn('[ChatMessages] attachDirectChatListener setup failed', e)
      options.onError?.(e)
    }
  })()

  return () => {
    cancelled = true
    unsub1?.()
    unsub2?.()
  }
}
