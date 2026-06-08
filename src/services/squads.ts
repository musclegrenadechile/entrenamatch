/**
 * Squads — fixed training crews in Firestore (multi-user).
 */

import type { Firestore } from 'firebase/firestore'
import type { Squad } from '../types'

function mapSquadDoc(id: string, data: any): Squad {
  const createdAt = data?.createdAt?.toMillis
    ? data.createdAt.toMillis()
    : (typeof data?.createdAt === 'number' ? data.createdAt : Date.now())
  const routine = data?.weeklyRoutine
  return {
    id,
    name: data?.name || 'Squad',
    focus: data?.focus || 'Mixto',
    members: Array.isArray(data?.members) ? data.members : [],
    createdBy: data?.createdBy || '',
    createdAt,
    city: data?.city || undefined,
    weeklyRoutine: routine
      ? {
          label: routine.label || '',
          schedule: routine.schedule || '',
          notes: routine.notes || undefined,
          updatedAt: typeof routine.updatedAt === 'number' ? routine.updatedAt : Date.now(),
          updatedBy: routine.updatedBy || '',
        }
      : undefined,
    weeklyChallenge: data?.weeklyChallenge
      ? {
          weekKey: data.weeklyChallenge.weekKey || '',
          targetSessions: Number(data.weeklyChallenge.targetSessions) || 3,
          progressSessions: Number(data.weeklyChallenge.progressSessions) || 0,
          label: data.weeklyChallenge.label || '',
          updatedAt: Number(data.weeklyChallenge.updatedAt) || Date.now(),
        }
      : undefined,
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
  const { doc, getDoc, updateDoc } = await import('firebase/firestore')
  const ref = doc(db, 'squads', squadId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Squad not found')
  const members = Array.isArray(snap.data()?.members) ? snap.data()!.members : []
  if (members.includes(uid)) return
  // Explicit array (not arrayUnion) so security rules see uid in request.resource.data.members.
  await updateDoc(ref, { members: [...members, uid] })
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

export async function updateSquadRoutineInFirestore(
  db: Firestore,
  squadId: string,
  uid: string,
  routine: { label: string; schedule: string; notes?: string }
): Promise<void> {
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, 'squads', squadId), {
    weeklyRoutine: {
      label: routine.label.trim(),
      schedule: routine.schedule.trim(),
      notes: routine.notes?.trim() || null,
      updatedAt: Date.now(),
      updatedBy: uid,
    },
  })
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
