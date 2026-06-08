/**
 * Squad retos semanales — meta grupal en squads/{id}.weeklyChallenge
 */

import { doc, updateDoc, type Firestore } from 'firebase/firestore'
import type { SquadWeeklyChallenge } from '../types'
import { getWeekKey } from '../utils/weekLiveTracker'

export type { SquadWeeklyChallenge }

export function defaultSquadChallenge(weekKey = getWeekKey()): SquadWeeklyChallenge {
  return {
    weekKey,
    targetSessions: 3,
    progressSessions: 0,
    label: '3 sesiones en equipo esta semana',
    updatedAt: Date.now(),
  }
}

export function mapSquadChallenge(data: unknown, weekKey = getWeekKey()): SquadWeeklyChallenge {
  const c = data as Partial<SquadWeeklyChallenge> | undefined
  if (!c || c.weekKey !== weekKey) return defaultSquadChallenge(weekKey)
  return {
    weekKey,
    targetSessions: Math.max(1, Number(c.targetSessions) || 3),
    progressSessions: Math.max(0, Number(c.progressSessions) || 0),
    label: c.label || defaultSquadChallenge(weekKey).label,
    updatedAt: typeof c.updatedAt === 'number' ? c.updatedAt : Date.now(),
  }
}

export async function incrementSquadChallengeProgress(
  db: Firestore,
  squadId: string,
  delta = 1
): Promise<void> {
  const { getDoc } = await import('firebase/firestore')
  const ref = doc(db, 'squads', squadId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const weekKey = getWeekKey()
  const current = mapSquadChallenge(snap.data()?.weeklyChallenge, weekKey)
  await updateDoc(ref, {
    weeklyChallenge: {
      ...current,
      progressSessions: Math.min(current.targetSessions, current.progressSessions + delta),
      updatedAt: Date.now(),
    },
  })
}

export async function initSquadWeeklyChallenge(db: Firestore, squadId: string): Promise<void> {
  const { getDoc } = await import('firebase/firestore')
  const ref = doc(db, 'squads', squadId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const weekKey = getWeekKey()
  const existing = snap.data()?.weeklyChallenge
  if (existing?.weekKey === weekKey) return
  await updateDoc(ref, { weeklyChallenge: defaultSquadChallenge(weekKey) })
}
