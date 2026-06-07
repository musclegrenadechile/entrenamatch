/**
 * Post comments — Firestore subcollection persistence + merge helpers.
 * Path: profilePosts/{postId}/comments/{commentId}
 * Demo mode uses in-memory / localStorage only (handled by App.tsx).
 */

import type { Firestore } from 'firebase/firestore'

export interface PostComment {
  id: string
  userId: string
  userName: string
  text: string
  timestamp: number
  /** Optimistic local-only flag until Firestore confirms the write */
  _pending?: boolean
}

export function createCommentId(): string {
  return `c${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function normalizePostComment(raw: any): PostComment | null {
  if (!raw) return null
  const id = raw.id || raw.commentId
  const text = (raw.text || '').trim()
  if (!id || !text) return null
  const ts = Number(raw.timestamp)
  return {
    id: String(id),
    userId: raw.userId || '',
    userName: raw.userName || 'Usuario',
    text,
    timestamp: Number.isFinite(ts) ? ts : Date.now(),
    _pending: !!raw._pending,
  }
}

/** Merge remote (Firestore) + local; Firestore wins on id conflict; keep pending not yet in remote. */
export function mergeCommentLists(
  remote: PostComment[],
  local: PostComment[] = []
): PostComment[] {
  const byId = new Map<string, PostComment>()
  for (const c of remote) {
    const n = normalizePostComment(c)
    if (n) byId.set(n.id, { ...n, _pending: false })
  }
  for (const c of local) {
    const n = normalizePostComment(c)
    if (!n) continue
    if (byId.has(n.id)) continue
    if (n._pending) byId.set(n.id, n)
  }
  return Array.from(byId.values()).sort((a, b) => a.timestamp - b.timestamp)
}

export function normalizeInlineComments(raw: unknown): PostComment[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizePostComment).filter(Boolean) as PostComment[]
}

export async function fetchPostComments(
  db: Firestore,
  postId: string,
  inlineFallback?: unknown
): Promise<PostComment[]> {
  try {
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
    const q = query(
      collection(db, 'profilePosts', postId, 'comments'),
      orderBy('timestamp', 'asc')
    )
    const snap = await getDocs(q)
    const fromSub = snap.docs
      .map((d) => normalizePostComment({ id: d.id, ...d.data() }))
      .filter(Boolean) as PostComment[]
    if (fromSub.length > 0) {
      return mergeCommentLists(fromSub, normalizeInlineComments(inlineFallback))
    }
  } catch (e) {
    console.warn('fetchPostComments subcollection failed, using inline fallback', postId, e)
  }
  return normalizeInlineComments(inlineFallback)
}

export async function writeCommentToFirestore(
  db: Firestore,
  postId: string,
  comment: PostComment,
  sanitize: (obj: unknown) => unknown
): Promise<boolean> {
  try {
    const { doc, setDoc, updateDoc, serverTimestamp, increment } = await import('firebase/firestore')
    const payload = sanitize({
      userId: comment.userId,
      userName: comment.userName,
      text: comment.text,
      timestamp: comment.timestamp,
      createdAt: serverTimestamp(),
    }) as Record<string, unknown>
    await setDoc(doc(db, 'profilePosts', postId, 'comments', comment.id), payload, { merge: true })
    try {
      await updateDoc(doc(db, 'profilePosts', postId), {
        lastCommentAt: serverTimestamp(),
        commentCount: increment(1),
      })
    } catch {
      // non-critical metadata
    }
    return true
  } catch (e) {
    console.warn('writeCommentToFirestore failed', e)
    return false
  }
}

export async function deleteCommentFromFirestore(
  db: Firestore,
  postId: string,
  commentId: string
): Promise<boolean> {
  try {
    const { doc, deleteDoc, updateDoc, increment } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'profilePosts', postId, 'comments', commentId))
    try {
      await updateDoc(doc(db, 'profilePosts', postId), { commentCount: increment(-1) })
    } catch {}
    return true
  } catch (e) {
    console.warn('deleteCommentFromFirestore failed', e)
    return false
  }
}

/** Real-time listener for a post's comments subcollection. */
export function attachPostCommentsListener(
  db: Firestore,
  postId: string,
  onUpdate: (comments: PostComment[]) => void,
  inlineFallback?: unknown
): () => void {
  let unsubFn: (() => void) | null = null
  let cancelled = false

  ;(async () => {
    try {
      const { collection, onSnapshot, query, orderBy } = await import('firebase/firestore')
      const q = query(
        collection(db, 'profilePosts', postId, 'comments'),
        orderBy('timestamp', 'asc')
      )
      unsubFn = onSnapshot(
        q,
        (snap) => {
          if (cancelled) return
          const comments = snap.docs
            .map((d) => normalizePostComment({ id: d.id, ...d.data() }))
            .filter(Boolean) as PostComment[]
          const inline = normalizeInlineComments(inlineFallback)
          const merged = mergeCommentLists(comments, inline)
          onUpdate(merged)
        },
        (err) => {
          console.warn('post comments listener error', postId, err)
          if (!cancelled && inlineFallback) {
            onUpdate(normalizeInlineComments(inlineFallback))
          }
        }
      )
      if (cancelled) {
        unsubFn()
        unsubFn = null
      }
    } catch (e) {
      console.warn('attachPostCommentsListener setup failed', e)
      if (inlineFallback) onUpdate(normalizeInlineComments(inlineFallback))
    }
  })()

  return () => {
    cancelled = true
    unsubFn?.()
  }
}
