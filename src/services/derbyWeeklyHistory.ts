import type { Firestore } from 'firebase/firestore'
import type { CityDerbyState } from './cityDerby'
import { DERBY_AWAY, DERBY_HOME, resolveDerbyTeam } from './cityDerby'

export type DerbyWeekResult = {
  weekKey: string
  winnerNorm: string
  winnerLabel: string
  homeIndex: number
  awayIndex: number
  marginIndex: number
  recordedAt: number
}

const LOCAL_KEY = 'em-derby-weekly-history'

function readLocal(): Record<string, DerbyWeekResult> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as Record<string, DerbyWeekResult>) : {}
  } catch {
    return {}
  }
}

function writeLocal(map: Record<string, DerbyWeekResult>): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

/** Fase 104 — guarda ganador semanal cuando hay líder claro. */
export function recordDerbyWeekSnapshot(derby: CityDerbyState): DerbyWeekResult | null {
  if (!derby.leaderNorm || derby.isTie) return null
  const entry: DerbyWeekResult = {
    weekKey: derby.weekKey,
    winnerNorm: derby.leaderNorm,
    winnerLabel: derby.leaderLabel || derby.leaderNorm,
    homeIndex: derby.home.indexPer100k,
    awayIndex: derby.away.indexPer100k,
    marginIndex: derby.marginIndex,
    recordedAt: Date.now(),
  }
  const map = readLocal()
  map[derby.weekKey] = entry
  writeLocal(map)
  return entry
}

export function getDerbyWeekResult(weekKey: string): DerbyWeekResult | null {
  return readLocal()[weekKey] ?? null
}

export function getLatestDerbyWeekResult(): DerbyWeekResult | null {
  const map = readLocal()
  const keys = Object.keys(map).sort()
  if (!keys.length) return null
  return map[keys[keys.length - 1]] ?? null
}

export function isUserDerbyDefender(city: string | null | undefined): boolean {
  const latest = getLatestDerbyWeekResult()
  if (!latest) return false
  const team = resolveDerbyTeam(city)
  if (team === 'home' && latest.winnerNorm === DERBY_HOME.norm) return true
  if (team === 'away' && latest.winnerNorm === DERBY_AWAY.norm) return true
  return false
}

export async function persistDerbyWeekToFirestore(
  db: Firestore,
  result: DerbyWeekResult
): Promise<void> {
  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
    await setDoc(
      doc(db, 'derbyWeeklyWinners', result.weekKey),
      { ...result, updatedAt: serverTimestamp() },
      { merge: true }
    )
  } catch {
    /* non-blocking */
  }
}
