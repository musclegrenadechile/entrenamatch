/**
 * Real witness counter for EntrenaSync — third parties who open GymPulse/feed
 * while a sync is active get recorded on syncSessions.witnesses.
 */

import { arrayUnion, doc, updateDoc, type Firestore } from 'firebase/firestore'

export function countExternalWitnesses(
  witnesses: unknown,
  participantA: string,
  participantB: string
): number {
  if (!Array.isArray(witnesses)) return 0
  const exclude = new Set([participantA, participantB, 'me'])
  return witnesses.filter((w) => typeof w === 'string' && !exclude.has(w)).length
}

/** Register current user as witness (idempotent via arrayUnion). */
export async function registerSyncWitness(
  db: Firestore,
  sessionId: string,
  uid: string
): Promise<void> {
  if (!sessionId || !uid || uid === 'me') return
  try {
    await updateDoc(doc(db, 'syncSessions', sessionId), {
      witnesses: arrayUnion(uid),
      lastWitnessAt: Date.now(),
    })
  } catch (e) {
    console.warn('registerSyncWitness failed (non-fatal)', e)
  }
}
