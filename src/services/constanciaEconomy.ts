import type { Firestore } from 'firebase/firestore'

export interface ConstanciaBalance {
  userId: string
  points: number
  streakInsuranceUntil?: string
  updatedAt: number
}

/** Phase 88 — Constancia economy persisted in Firestore. */
export async function loadConstanciaBalance(
  db: Firestore,
  userId: string
): Promise<ConstanciaBalance | null> {
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'constanciaBalances', userId))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    userId,
    points: Number(d.points) || 0,
    streakInsuranceUntil: d.streakInsuranceUntil as string | undefined,
    updatedAt: Number(d.updatedAt) || Date.now(),
  }
}

export async function saveConstanciaBalance(
  db: Firestore,
  userId: string,
  points: number,
  extra?: Partial<Pick<ConstanciaBalance, 'streakInsuranceUntil'>>
): Promise<void> {
  const { doc, setDoc } = await import('firebase/firestore')
  await setDoc(
    doc(db, 'constanciaBalances', userId),
    {
      userId,
      points: Math.max(0, points),
      updatedAt: Date.now(),
      ...extra,
    },
    { merge: true }
  )
}

export async function spendConstancia(
  db: Firestore,
  userId: string,
  cost: number
): Promise<number> {
  const current = (await loadConstanciaBalance(db, userId))?.points ?? 0
  if (current < cost) throw new Error('insufficient_constancia')
  const next = current - cost
  await saveConstanciaBalance(db, userId, next)
  return next
}
