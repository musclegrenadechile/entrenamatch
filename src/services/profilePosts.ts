/**
 * Profile muro posts — Firestore RT listener + fetch helpers.
 * Path: profilePosts/{postId}
 */

import type { Firestore } from 'firebase/firestore'
import type { ProfilePost } from '../types'
import { fetchPostComments } from './postComments'

export function docToProfilePost(docSnap: { id: string; data: () => Record<string, unknown> }): ProfilePost {
  const d = docSnap.data()
  const ts = Number(d.timestamp)
  return {
    id: docSnap.id,
    userId: String(d.userId || ''),
    text: String(d.text || ''),
    photo: d.photo as string | undefined,
    timestamp: Number.isFinite(ts) ? ts : Date.now(),
    likes: Array.isArray(d.likes) ? (d.likes as string[]) : [],
    pinned: !!d.pinned,
    reactions: (d.reactions as ProfilePost['reactions']) || {},
    comments: [],
  }
}

export async function fetchUserProfilePosts(
  db: Firestore,
  userId: string,
  limitCount = 30
): Promise<ProfilePost[]> {
  const { collection, query, where, getDocs, limit } = await import('firebase/firestore')
  const q = query(
    collection(db, 'profilePosts'),
    where('userId', '==', userId),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  const posts: ProfilePost[] = []
  await Promise.all(
    snap.docs.map(async (docSnap) => {
      const post = docToProfilePost(docSnap)
      post.comments = await fetchPostComments(db, docSnap.id, [])
      posts.push(post)
    })
  )
  posts.sort((a, b) => b.timestamp - a.timestamp)
  return posts.slice(0, 10)
}

/** Real-time listener for one user's muro posts (orderBy timestamp desc). */
export function attachUserPostsListener(
  db: Firestore,
  userId: string,
  onUpdate: (posts: ProfilePost[]) => void,
  options: { maxResults?: number; onError?: (err: unknown) => void } = {}
): () => void {
  const { maxResults = 10, onError } = options
  let unsubFn: (() => void) | null = null
  let cancelled = false

  ;(async () => {
    try {
      const { collection, query, where, orderBy, limit, onSnapshot } = await import('firebase/firestore')
      const q = query(
        collection(db, 'profilePosts'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(maxResults)
      )

      unsubFn = onSnapshot(
        q,
        async (snap) => {
          if (cancelled) return
          const posts: ProfilePost[] = []
          await Promise.all(
            snap.docs.map(async (docSnap) => {
              const post = docToProfilePost(docSnap)
              post.comments = await fetchPostComments(db, docSnap.id, [])
              posts.push(post)
            })
          )
          posts.sort((a, b) => b.timestamp - a.timestamp)
          onUpdate(posts.slice(0, maxResults))
        },
        (err) => {
          console.warn('[ProfilePosts] listener error', userId, err)
          onError?.(err)
        }
      )

      if (cancelled) {
        unsubFn()
        unsubFn = null
      }
    } catch (e) {
      console.warn('[ProfilePosts] attachUserPostsListener setup failed', e)
      onError?.(e)
    }
  })()

  return () => {
    cancelled = true
    unsubFn?.()
  }
}
