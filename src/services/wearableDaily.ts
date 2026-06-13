import type { Firestore } from 'firebase/firestore'

export interface WearableDailyDoc {
  userId: string
  date: string
  steps: number
  activeCaloriesKcal: number
  exerciseMinutes: number
  workoutCount: number
  sources: string[]
  platform?: 'ios' | 'android'
  syncedAt: number
}

function docId(userId: string, date: string): string {
  return `${userId}_${date}`
}

export async function saveWearableDailyCache(
  db: Firestore,
  userId: string,
  doc: Omit<WearableDailyDoc, 'userId'>
): Promise<void> {
  const { doc: fsDoc, setDoc } = await import('firebase/firestore')
  const payload: WearableDailyDoc = {
    userId,
    ...doc,
    syncedAt: doc.syncedAt || Date.now(),
  }
  await setDoc(fsDoc(db, 'wearableDaily', docId(userId, doc.date)), payload, { merge: true })
}

export async function loadWearableDailyCache(
  db: Firestore,
  userId: string,
  date: string
): Promise<WearableDailyDoc | null> {
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'wearableDaily', docId(userId, date)))
  if (!snap.exists()) return null
  return snap.data() as WearableDailyDoc
}
