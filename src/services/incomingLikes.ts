/**
 * Real-time listener for incoming swipe-right (likes) on the current user.
 */

import type { Firestore } from 'firebase/firestore'

export type IncomingLike = {
  id: string
  likerId: string
  likedId: string
}

export function attachIncomingLikesListener(
  db: Firestore,
  myUid: string,
  opts: {
    getLikerName: (likerId: string) => string | undefined
    isAlreadyMatched: (likerId: string) => boolean
    onIncomingLike: (like: IncomingLike, likerName: string) => void
  }
): () => void {
  let cancelled = false
  let unsubscribe: (() => void) | undefined
  const seenIds = new Set<string>()
  let initialized = false

  void (async () => {
    try {
      const { collection, query, where, onSnapshot } = await import('firebase/firestore')
      if (cancelled) return

      const q = query(collection(db, 'likes'), where('liked', '==', myUid))
      unsubscribe = onSnapshot(
        q,
        (snap) => {
          snap.docChanges().forEach((change) => {
            if (change.type !== 'added') return
            const id = change.doc.id
            if (seenIds.has(id)) return
            seenIds.add(id)

            const data = change.doc.data() as { liker?: string; liked?: string }
            const likerId = data.liker
            if (!likerId || likerId === myUid) return

            if (!initialized) return

            if (opts.isAlreadyMatched(likerId)) return

            const likerName = opts.getLikerName(likerId) || 'Alguien'
            opts.onIncomingLike({ id, likerId, likedId: myUid }, likerName)
          })
          initialized = true
        },
        (err) => console.warn('[incomingLikes] listener error', err)
      )
    } catch (e) {
      console.warn('[incomingLikes] setup failed', e)
    }
  })()

  return () => {
    cancelled = true
    try {
      unsubscribe?.()
    } catch {
      /* ignore */
    }
  }
}
