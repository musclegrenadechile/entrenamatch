/**
 * Swipe deck state in Firestore — deck exclusion lives on profiles/{uid}
 * (owner read/write already allowed). Top-level likes/passes collections remain
 * for matching; profile arrays are the reliable cross-device deck source.
 */

import type { Firestore } from 'firebase/firestore'

export function passDocId(passer: string, passed: string): string {
  return `${passer}_${passed}`
}

function dedupeIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  const seen = new Set<string>()
  for (const v of raw) {
    if (typeof v === 'string' && v && !seen.has(v)) {
      seen.add(v)
      out.push(v)
    }
  }
  return out
}

/** Persist left-swipe deck exclusion on the user's profile (always permitted for owner). */
export async function syncPassToProfileDeck(
  db: Firestore,
  passerId: string,
  passedId: string
): Promise<void> {
  if (!passerId || !passedId || passerId === passedId) return
  const { doc, updateDoc, arrayUnion, serverTimestamp } = await import('firebase/firestore')
  await updateDoc(doc(db, 'profiles', passerId), {
    swipePassedIds: arrayUnion(passedId),
    swipeDeckUpdatedAt: serverTimestamp(),
  })
}

/** Persist right-swipe deck exclusion on the user's profile. */
export async function syncLikeToProfileDeck(
  db: Firestore,
  likerId: string,
  likedId: string
): Promise<void> {
  if (!likerId || !likedId || likerId === likedId) return
  const { doc, updateDoc, arrayUnion, serverTimestamp } = await import('firebase/firestore')
  await updateDoc(doc(db, 'profiles', likerId), {
    swipeLikedIds: arrayUnion(likedId),
    swipeDeckUpdatedAt: serverTimestamp(),
  })
}

export async function writePass(
  db: Firestore,
  passerId: string,
  passedId: string
): Promise<void> {
  if (!passerId || !passedId || passerId === passedId) return
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  // Profile deck first — works with existing profiles rules even if passes rules lag deploy.
  await syncPassToProfileDeck(db, passerId, passedId)
  await setDoc(doc(db, 'passes', passDocId(passerId, passedId)), {
    passer: passerId,
    passed: passedId,
    createdAt: serverTimestamp(),
  }).catch((e) => console.warn('[swipeState] passes collection write failed (deck synced on profile)', e))
}

export async function loadSwipeStateForUser(
  db: Firestore,
  uid: string
): Promise<{ liked: string[]; passed: string[] }> {
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'profiles', uid))
  if (!snap.exists()) return { liked: [], passed: [] }
  const data = snap.data()
  return {
    liked: dedupeIds(data?.swipeLikedIds),
    passed: dedupeIds(data?.swipePassedIds),
  }
}
