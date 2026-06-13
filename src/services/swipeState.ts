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

/** After an explicit deck reset, profile arrays are empty + swipeDeckUpdatedAt set — ignore legacy passes. */
export function shouldMergeLegacyPasses(data: Record<string, unknown> | undefined | null): boolean {
  if (!data) return true
  const liked = dedupeIds(data.swipeLikedIds)
  const passed = dedupeIds(data.swipePassedIds)
  if (passed.length === 0 && liked.length === 0 && data.swipeDeckUpdatedAt != null) {
    return false
  }
  return true
}

export async function loadSwipeStateForUser(
  db: Firestore,
  uid: string
): Promise<{ liked: string[]; passed: string[] }> {
  const { collection, doc, getDoc, getDocs, query, where } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'profiles', uid))
  const data = snap.exists() ? (snap.data() as Record<string, unknown>) : {}
  let liked = dedupeIds(data?.swipeLikedIds)
  let passed = dedupeIds(data?.swipePassedIds)

  // Merge passes collection (legacy writes) unless the owner explicitly reset the deck.
  if (shouldMergeLegacyPasses(data)) {
    try {
      const passSnap = await getDocs(query(collection(db, 'passes'), where('passer', '==', uid)))
      const fromPasses = passSnap.docs
        .map((d) => d.data()?.passed)
        .filter((id): id is string => typeof id === 'string' && !!id)
      passed = dedupeIds([...passed, ...fromPasses])
    } catch (e) {
      console.warn('[swipeState] passes query failed', e)
    }
  }

  return { liked, passed }
}

/** Clear explore deck exclusions for the current user (pilot recovery / re-see partners). */
export async function clearSwipeDeckForUser(db: Firestore, uid: string): Promise<void> {
  if (!uid) return
  const { collection, doc, getDocs, query, where, updateDoc, deleteDoc, serverTimestamp } =
    await import('firebase/firestore')
  await updateDoc(doc(db, 'profiles', uid), {
    swipePassedIds: [],
    swipeLikedIds: [],
    swipeDeckUpdatedAt: serverTimestamp(),
  })
  try {
    const passSnap = await getDocs(query(collection(db, 'passes'), where('passer', '==', uid)))
    await Promise.all(passSnap.docs.map((d) => deleteDoc(d.ref).catch(() => {})))
  } catch (e) {
    console.warn('[swipeState] clear passes collection failed', e)
  }
}
