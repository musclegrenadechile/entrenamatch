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

/** Phase 92 — reward Constancia after meaningful actions (workout, sync, etc.). */
export async function earnConstancia(
  db: Firestore,
  userId: string,
  amount: number,
  seedIfMissing = 0
): Promise<number> {
  if (amount <= 0) return (await loadConstanciaBalance(db, userId))?.points ?? seedIfMissing
  const current = (await loadConstanciaBalance(db, userId))?.points ?? seedIfMissing
  const next = current + amount
  await saveConstanciaBalance(db, userId, next)
  return next
}

/** Phase 93 — one-time seed from legacy momentum field. */
export async function ensureConstanciaBalance(
  db: Firestore,
  userId: string,
  momentumFallback: number
): Promise<number> {
  const existing = await loadConstanciaBalance(db, userId)
  if (existing) return existing.points
  const seed = Math.max(0, momentumFallback)
  await saveConstanciaBalance(db, userId, seed)
  return seed
}
