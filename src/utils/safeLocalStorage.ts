/** Safe localStorage helpers — never crash the app on QuotaExceededError. */

import type { Notification } from '../types'

export const NOTIFICATIONS_STORAGE_KEY = 'entrenamatch_notifications'
export const MAX_STORED_NOTIFICATIONS = 25

/** Browsers typically allow ~5–10MB per origin; Firestore mutations also use localStorage. */
const SOFT_LIMIT_BYTES = 4 * 1024 * 1024

const BULKY_KEYS_TO_EVICT = [
  'entrenamatch_last_live',
  'entrenamatch_profile_posts',
  'entrenamatch_seen_chat_msgs',
  'entrenamatch_seen_group_msgs',
  'entrenamatch_seen_live_joins',
  'entrenamatch_sessions',
  'entrenamatch_squads',
  'fitvina_messages',
] as const

const FIRESTORE_OVERLAY_PREFIXES = ['firestore_targets_', 'firestore_online_state_'] as const

export function isQuotaError(err: unknown): boolean {
  const name = (err as { name?: string })?.name
  const msg = String((err as { message?: string })?.message || err || '')
  return name === 'QuotaExceededError' || msg.includes('quota') || msg.includes('QuotaExceeded')
}

/** Rough UTF-16 byte estimate for all localStorage keys on this origin. */
export function estimateLocalStorageBytes(): number {
  if (typeof localStorage === 'undefined') return 0
  let total = 0
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k) continue
      const v = localStorage.getItem(k) || ''
      total += (k.length + v.length) * 2
    }
  } catch {
    return 0
  }
  return total
}

function removeKeysByPrefix(prefix: string): number {
  if (typeof localStorage === 'undefined') return 0
  let removed = 0
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k?.startsWith(prefix)) {
        localStorage.removeItem(k)
        removed++
      }
    }
  } catch {
    /* ignore */
  }
  return removed
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

/**
 * Free localStorage so Firestore can persist offline mutations (chat, writes).
 * soft — app caches only; hard — also Firestore overlay keys (+ mutations as last resort).
 */
export function reclaimLocalStorageSpace(level: 'soft' | 'hard' = 'soft'): boolean {
  if (typeof localStorage === 'undefined') return false
  const before = estimateLocalStorageBytes()
  evictBulkyLocalStorageKeys()

  if (level === 'hard') {
    for (const prefix of FIRESTORE_OVERLAY_PREFIXES) {
      removeKeysByPrefix(prefix)
    }
    if (estimateLocalStorageBytes() > SOFT_LIMIT_BYTES) {
      removeKeysByPrefix('firestore_mutations_')
    }
  }

  return estimateLocalStorageBytes() < before
}

/** Run once on boot before Firestore init if storage is nearly full. */
export function ensureLocalStorageHeadroom(): void {
  if (typeof localStorage === 'undefined') return
  try {
    if (estimateLocalStorageBytes() > SOFT_LIMIT_BYTES) {
      reclaimLocalStorageSpace('soft')
    }
    // Dead weight: full profile snapshots were written but never read.
    localStorage.removeItem('entrenamatch_last_live')
  } catch {
    /* ignore */
  }
}

let quotaGuardInstalled = false

/** Catch Firestore mutation quota failures so chat does not spam uncaught rejections. */
export function installStorageQuotaGuard(): void {
  if (quotaGuardInstalled || typeof window === 'undefined') return
  quotaGuardInstalled = true

  window.addEventListener('unhandledrejection', (event) => {
    if (!isQuotaError(event.reason)) return
    const msg = String((event.reason as { message?: string })?.message || event.reason || '')
    const firestoreRelated =
      msg.includes('firestore') || msg.includes('setItem') || msg.includes('Storage')

    reclaimLocalStorageSpace(firestoreRelated ? 'hard' : 'soft')
    event.preventDefault()

    import('sonner')
      .then(({ toast }) => {
        toast.warning('Almacenamiento del navegador lleno', {
          description: 'Liberamos espacio automáticamente. Reintenta enviar el mensaje.',
          duration: 6000,
        })
      })
      .catch(() => {})
  })
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
    reclaimLocalStorageSpace('soft')

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
