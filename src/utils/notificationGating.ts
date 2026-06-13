import type { Notification } from '../types'

export type NotifPrefs = {
  messages: boolean
  live: boolean
  muro: boolean
  dailyPulse: boolean
  weeklyPact: boolean
  weeklyPlan: boolean
}

export const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  messages: true,
  live: true,
  muro: true,
  dailyPulse: true,
  weeklyPact: true,
  weeklyPlan: true,
}

const NOTIF_PREFS_KEY = 'entrenamatch_notif_prefs'

export function loadNotifPrefs(): NotifPrefs {
  try {
    const saved = localStorage.getItem(NOTIF_PREFS_KEY)
    const p = saved ? JSON.parse(saved) : {}
    return {
      messages: p.messages !== false,
      live: p.live !== false,
      muro: p.muro !== false,
      dailyPulse: p.dailyPulse !== false,
      weeklyPact: p.weeklyPact !== false,
      weeklyPlan: p.weeklyPlan !== false,
    }
  } catch {
    return { ...DEFAULT_NOTIF_PREFS }
  }
}

export function persistNotifPrefs(prefs: NotifPrefs): void {
  try {
    localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs))
  } catch {
    /* quota — non-fatal */
  }
}

/** Gate in-app notification rows by user prefs (per-device). */
export function shouldAllowNotificationType(type: string, prefs: NotifPrefs): boolean {
  if (
    type.includes('message') ||
    type === 'match' ||
    type === 'like_received' ||
    type === 'verification' ||
    type === 'report'
  ) {
    return prefs.messages
  }
  if (type === 'session_join' || type === 'squad_join' || type === 'live_nearby') {
    return prefs.live
  }
  return true
}

const DEDUP_WINDOW_MS = 1000 * 60 * 5

export function isDuplicateNotification(
  notifications: Notification[],
  relatedId: string | undefined,
  type: string,
  now = Date.now()
): boolean {
  return notifications.some(
    (n) =>
      n.relatedId === relatedId &&
      n.type === type &&
      now - (n.timestamp || 0) < DEDUP_WINDOW_MS
  )
}
