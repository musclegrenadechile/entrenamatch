/** Safe localStorage helpers — never crash the app on QuotaExceededError. */

import type { Notification } from '../types'

export const NOTIFICATIONS_STORAGE_KEY = 'entrenamatch_notifications'
export const MAX_STORED_NOTIFICATIONS = 25

const BULKY_KEYS_TO_EVICT = [
  'entrenamatch_last_live',
  'entrenamatch_profile_posts',
  'entrenamatch_seen_chat_msgs',
  'entrenamatch_seen_group_msgs',
  'entrenamatch_seen_live_joins',
] as const

function isQuotaError(err: unknown): boolean {
  const name = (err as { name?: string })?.name
  const msg = String((err as { message?: string })?.message || err || '')
  return name === 'QuotaExceededError' || msg.includes('quota') || msg.includes('QuotaExceeded')
}

export function trimNotificationForStorage(n: Notification): Notification {
  const photoUrl =
    n.photoUrl && n.photoUrl.startsWith('https://') && n.photoUrl.length < 512
      ? n.photoUrl
      : undefined
  return {
    ...n,
    title: (n.title || '').slice(0, 120),
    body: (n.body || '').slice(0, 240),
    photoUrl,
  }
}

export function pruneNotifications(
  list: Notification[],
  max = MAX_STORED_NOTIFICATIONS
): Notification[] {
  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const filtered = list
    .filter((n) => n && typeof n.id === 'string')
    .filter((n) => !n.read || now - (n.timestamp || 0) < weekMs)
    .map(trimNotificationForStorage)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

  const unread = filtered.filter((n) => !n.read)
  const read = filtered.filter((n) => n.read)
  const keepRead = Math.max(0, max - unread.length)
  return [...unread, ...read.slice(0, keepRead)].slice(0, max)
}

function evictBulkyLocalStorageKeys() {
  for (const key of BULKY_KEYS_TO_EVICT) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  }
}

export function safeGetJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    return null
  }
}

export function safeSetJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    if (!isQuotaError(err)) {
      console.warn(`localStorage set failed for ${key}`, err)
      return false
    }

    if (key === NOTIFICATIONS_STORAGE_KEY && Array.isArray(value)) {
      for (const limit of [20, 12, 6, 3]) {
        try {
          const trimmed = pruneNotifications(value as Notification[], limit)
          localStorage.setItem(key, JSON.stringify(trimmed))
          return true
        } catch {
          /* try smaller */
        }
      }
    }

    evictBulkyLocalStorageKeys()

    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      if (key === NOTIFICATIONS_STORAGE_KEY && Array.isArray(value)) {
        try {
          localStorage.setItem(
            key,
            JSON.stringify(pruneNotifications(value as Notification[], 3))
          )
          return true
        } catch {
          try {
            localStorage.removeItem(key)
          } catch {
            /* ignore */
          }
        }
      }
    }

    console.warn(`localStorage quota exceeded for ${key} — kept in memory only`)
    return false
  }
}

export function loadStoredNotifications(): Notification[] {
  const loaded = safeGetJSON<Notification[]>(NOTIFICATIONS_STORAGE_KEY)
  if (!Array.isArray(loaded)) return []
  const pruned = pruneNotifications(loaded)
  if (pruned.length !== loaded.length) {
    safeSetJSON(NOTIFICATIONS_STORAGE_KEY, pruned)
  }
  return pruned
}

export function saveStoredNotifications(list: Notification[]): Notification[] {
  const pruned = pruneNotifications(list)
  safeSetJSON(NOTIFICATIONS_STORAGE_KEY, pruned)
  return pruned
}
