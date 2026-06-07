/**
 * Squads — fixed training crews in Firestore (multi-user).
 */

import type { Firestore } from 'firebase/firestore'
import type { Squad } from '../types'

function mapSquadDoc(id: string, data: any): Squad {
  const createdAt = data?.createdAt?.toMillis
    ? data.createdAt.toMillis()
    : (typeof data?.createdAt === 'number' ? data.createdAt : Date.now())
  return {
    id,
    name: data?.name || 'Squad',
    focus: data?.focus || 'Mixto',
    members: Array.isArray(data?.members) ? data.members : [],
    createdBy: data?.createdBy || '',
    createdAt,
  }
}

export async function createSquadInFirestore(
  db: Firestore,
  uid: string,
  name: string,
  focus: string
): Promise<Squad> {
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  const id = `sq_${Date.now()}`
  const payload = {
    name: name.trim(),
    focus: focus.trim(),
    members: [uid],
    createdBy: uid,
    createdAt: serverTimestamp(),
  }
  await setDoc(doc(db, 'squads', id), payload)
  return {
    id,
    name: payload.name,
    focus: payload.focus,
    members: [uid],
    createdBy: uid,
    createdAt: Date.now(),
  }
}

export async function joinSquadInFirestore(
  db: Firestore,
  squadId: string,
  uid: string
): Promise<void> {
  const { doc, updateDoc, arrayUnion } = await import('firebase/firestore')
  await updateDoc(doc(db, 'squads', squadId), {
    members: arrayUnion(uid),
  })
}

export async function leaveSquadInFirestore(
  db: Firestore,
  squadId: string,
  uid: string
): Promise<void> {
  const { doc, getDoc, updateDoc } = await import('firebase/firestore')
  const ref = doc(db, 'squads', squadId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const members = (snap.data()?.members || []).filter((m: string) => m !== uid)
  await updateDoc(ref, { members })
}

/** Real-time squads list (newest first). */
export function attachSquadsListener(
  db: Firestore,
  onSquads: (squads: Squad[]) => void
): () => void {
  let cancelled = false
  let unsub: (() => void) | null = null

  ;(async () => {
    const { collection, query, orderBy, limit, onSnapshot } = await import('firebase/firestore')
    if (cancelled) return
    const q = query(collection(db, 'squads'), orderBy('createdAt', 'desc'), limit(50))
    unsub = onSnapshot(
      q,
      (snap) => {
        if (cancelled) return
        const list: Squad[] = []
        snap.forEach((d) => list.push(mapSquadDoc(d.id, d.data())))
        onSquads(list)
      },
      (err) => {
        console.warn('[squads] listener error', err)
        if (!cancelled) onSquads([])
      }
    )
  })()

  return () => {
    cancelled = true
    unsub?.()
  }
}
