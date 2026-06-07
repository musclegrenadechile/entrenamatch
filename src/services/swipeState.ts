/**
 * Swipe deck state in Firestore — likes (matching.ts) + passes (this module).
 * Survives reload / new device for real users.
 */

import type { Firestore } from 'firebase/firestore'

export function passDocId(passer: string, passed: string): string {
  return `${passer}_${passed}`
}

export async function writePass(
  db: Firestore,
  passerId: string,
  passedId: string
): Promise<void> {
  if (!passerId || !passedId || passerId === passedId) return
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  await setDoc(doc(db, 'passes', passDocId(passerId, passedId)), {
    passer: passerId,
    passed: passedId,
    createdAt: serverTimestamp(),
  })
}

export async function loadSwipeStateForUser(
  db: Firestore,
  uid: string
): Promise<{ liked: string[]; passed: string[] }> {
  const { collection, query, where, getDocs } = await import('firebase/firestore')
  const [likesSnap, passesSnap] = await Promise.all([
    getDocs(query(collection(db, 'likes'), where('liker', '==', uid))),
    getDocs(query(collection(db, 'passes'), where('passer', '==', uid))),
  ])
  const liked: string[] = []
  likesSnap.forEach((d) => {
    const likedId = d.data()?.liked
    if (typeof likedId === 'string' && likedId) liked.push(likedId)
  })
  const passed: string[] = []
  passesSnap.forEach((d) => {
    const passedId = d.data()?.passed
    if (typeof passedId === 'string' && passedId) passed.push(passedId)
  })
  return { liked, passed }
}
