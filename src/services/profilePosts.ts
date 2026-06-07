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
    postType: d.postType as ProfilePost['postType'],
    workoutId: d.workoutId as string | undefined,
    workoutPreview: d.workoutPreview as ProfilePost['workoutPreview'],
    nutritionPreview: d.nutritionPreview as ProfilePost['nutritionPreview'],
    reactions: (d.reactions as ProfilePost['reactions']) || {},
    comments: [],
  }
}

export async function fetchProfilePostById(
  db: Firestore,
  postId: string
): Promise<ProfilePost | null> {
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'profilePosts', postId))
  if (!snap.exists()) return null
  const post = docToProfilePost(snap)
  post.comments = await fetchPostComments(db, postId, [])
  return post
}

export async function togglePostLikeInFirestore(
  db: Firestore,
  postId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<void> {
  const { doc, updateDoc, arrayUnion, arrayRemove } = await import('firebase/firestore')
  await updateDoc(doc(db, 'profilePosts', postId), {
    likes: currentlyLiked ? arrayRemove(userId) : arrayUnion(userId),
  })
}

export async function persistPostReactionsInFirestore(
  db: Firestore,
  postId: string,
  reactions: ProfilePost['reactions']
): Promise<void> {
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'profilePosts', postId), { reactions: reactions || {} })
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

export type GlobalPostsPage = {
  posts: ProfilePost[]
  lastDoc: import('firebase/firestore').QueryDocumentSnapshot | null
  hasMore: boolean
}

/** Community-wide feed — ordered by timestamp (requires Firestore index on profilePosts.timestamp). */
export async function fetchGlobalProfilePosts(
  db: Firestore,
  options: {
    pageSize?: number
    lastDoc?: import('firebase/firestore').QueryDocumentSnapshot | null
  } = {}
): Promise<GlobalPostsPage> {
  const pageSize = options.pageSize ?? 25
  const {
    collection,
    query,
    orderBy,
    limit,
    startAfter,
    getDocs,
  } = await import('firebase/firestore')

  let q = query(collection(db, 'profilePosts'), orderBy('timestamp', 'desc'), limit(pageSize))
  if (options.lastDoc) {
    q = query(
      collection(db, 'profilePosts'),
      orderBy('timestamp', 'desc'),
      startAfter(options.lastDoc),
      limit(pageSize)
    )
  }

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

  const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null
  return {
    posts,
    lastDoc,
    hasMore: snap.docs.length >= pageSize,
  }
}

