import type { Firestore } from 'firebase/firestore'
import type { DailyEnergyBalance } from '../domain/fuelBalance'

export interface DailyEnergyDoc {
  userId: string
  date: string
  baseTargetKcal: number
  workoutBurnKcal: number
  liveBurnKcal: number
  healthBurnKcal?: number
  adjustedTargetKcal: number
  consumed: DailyEnergyBalance['consumed']
  workoutIds: string[]
  liveMinutes: number
  dominantMuscle?: string
  updatedAt: number
}

function docId(userId: string, date: string): string {
  return `${userId}_${date}`
}

/** Phase 83 — cache daily energy balance in Firestore. */
export async function saveDailyEnergyCache(
  db: Firestore,
  userId: string,
  date: string,
  balance: DailyEnergyBalance,
  workoutIds: string[],
  liveMinutes = 0
): Promise<void> {
  const { doc, setDoc } = await import('firebase/firestore')
  const payload: DailyEnergyDoc = {
    userId,
    date,
    baseTargetKcal: balance.baseTargetKcal,
    workoutBurnKcal: balance.workoutBurnKcal,
    liveBurnKcal: balance.liveBurnKcal,
    healthBurnKcal: balance.healthBurnKcal,
    adjustedTargetKcal: balance.adjustedTargetKcal,
    consumed: balance.consumed,
    workoutIds,
    liveMinutes,
    dominantMuscle: balance.dominantMuscle,
    updatedAt: Date.now(),
  }
  await setDoc(doc(db, 'dailyEnergy', docId(userId, date)), payload, { merge: true })
}

export async function loadDailyEnergyCache(
  db: Firestore,
  userId: string,
  date: string
): Promise<DailyEnergyDoc | null> {
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'dailyEnergy', docId(userId, date)))
  if (!snap.exists()) return null
  return snap.data() as DailyEnergyDoc
}
