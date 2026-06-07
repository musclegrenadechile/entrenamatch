/**
 * Mutual matching — like first, match only when both users liked each other.
 * Paths: likes/{liker}_{liked}, matches/{sortedUidPair}
 */

import type { Firestore } from 'firebase/firestore'

export function likeDocId(liker: string, liked: string): string {
  return `${liker}_${liked}`
}

export function matchDocId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_')
}

export async function writeLike(
  db: Firestore,
  likerId: string,
  likedId: string
): Promise<void> {
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  await setDoc(
    doc(db, 'likes', likeDocId(likerId, likedId)),
    {
      liker: likerId,
      liked: likedId,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  )
}

/** True if `otherUid` already liked `myUid`. */
export async function hasReciprocalLike(
  db: Firestore,
  myUid: string,
  otherUid: string
): Promise<boolean> {
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'likes', likeDocId(otherUid, myUid)))
  return snap.exists()
}

export async function createMutualMatch(
  db: Firestore,
  uidA: string,
  uidB: string
): Promise<string> {
  const { doc, setDoc, getDoc, serverTimestamp } = await import('firebase/firestore')
  const id = matchDocId(uidA, uidB)
  const matchRef = doc(db, 'matches', id)
  const existing = await getDoc(matchRef)
  if (existing.exists()) return id

  const [user1, user2] = [uidA, uidB].sort()
  await setDoc(matchRef, {
    user1,
    user2,
    createdAt: serverTimestamp(),
    status: 'active',
    mutual: true,
  })
  return id
}

/** Write like; create match doc only when the other user already liked us. */
export async function processLikeAndMaybeMatch(
  db: Firestore,
  myUid: string,
  otherUid: string
): Promise<'matched' | 'liked'> {
  await writeLike(db, myUid, otherUid)
  const reciprocal = await hasReciprocalLike(db, myUid, otherUid)
  if (reciprocal) {
    await createMutualMatch(db, myUid, otherUid)
    return 'matched'
  }
  return 'liked'
}
