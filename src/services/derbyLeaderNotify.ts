import { toast } from 'sonner'
import type { CityDerbyState } from './cityDerby'
import { DERBY_AWAY, DERBY_HOME } from './cityDerby'

const STORAGE_KEY = 'em-derby-leader-sig'

function derbySignature(derby: CityDerbyState): string {
  return `${derby.weekKey}:${derby.leaderNorm ?? 'tie'}:${derby.marginIndex}`
}

/** Fase 103 — avisa cuando el rival regional supera tu zona (máx. 2×/semana en local). */
export function notifyDerbyLeaderChange(derby: CityDerbyState): void {
  if (typeof window === 'undefined') return
  const sig = derbySignature(derby)
  let prev: string | null = null
  try {
    prev = localStorage.getItem(STORAGE_KEY)
  } catch {
    return
  }
  if (!prev) {
    try {
      localStorage.setItem(STORAGE_KEY, sig)
    } catch {
      /* ignore */
    }
    return
  }
  if (prev === sig) return

  const weekNotifyKey = `em-derby-notify-${derby.weekKey}`
  let notifyCount = 0
  try {
    notifyCount = Number(sessionStorage.getItem(weekNotifyKey) || '0')
  } catch {
    /* ignore */
  }

  try {
    localStorage.setItem(STORAGE_KEY, sig)
  } catch {
    /* ignore */
  }

  if (!derby.myTeam || derby.isTie || !derby.leaderNorm || notifyCount >= 2) return

  const myNorm = derby.myTeam === 'home' ? DERBY_HOME.norm : DERBY_AWAY.norm
  if (derby.leaderNorm === myNorm) return

  const rival = derby.myTeam === 'home' ? derby.away.cityLabel : derby.home.cityLabel
  try {
    sessionStorage.setItem(weekNotifyKey, String(notifyCount + 1))
  } catch {
    /* ignore */
  }

  toast(`${rival} te superó en la Copa Zona`, {
    description: `+${derby.marginIndex} índice/100k hab — activa LIVE y recupera la zona`,
    duration: 6000,
  })
}
