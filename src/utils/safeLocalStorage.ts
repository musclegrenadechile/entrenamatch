/** Safe localStorage helpers — never crash the app on QuotaExceededError. */

import type { Notification } from '../types'

export const NOTIFICATIONS_STORAGE_KEY = 'entrenamatch_notifications'
export const MAX_STORED_NOTIFICATIONS = 25

/** Browsers typically allow ~5–10MB per origin; Firestore mutations also use localStorage. */
const SOFT_LIMIT_BYTES = 4 * 1024 * 1024
const PROACTIVE_PRUNE_BYTES = 2.5 * 1024 * 1024

export const MAX_SEEN_IDS_PER_CHAT = 80
export const MAX_SEEN_CHAT_THREADS = 40
export const MAX_SEEN_STRING_IDS = 300
export const MAX_PERSISTED_RED_SYNC_ENTRIES = 80

export const SEEN_LIVE_USERS_KEY = 'entrenamatch_seen_live_users'
export const SEEN_LIVE_JOINS_KEY = 'entrenamatch_seen_live_joins'
export const PREV_RED_SYNC_STATE_KEY = 'entrenamatch_prev_red_sync_state'

/** Skip foreground push/live toasts briefly after cold start (avoids burst on app open). */
export const SESSION_TOAST_GRACE_MS = 4000

const BULKY_KEYS_TO_EVICT = [
  'entrenamatch_last_live',
  'entrenamatch_profile_posts',
  'entrenamatch_seen_chat_msgs',
  'entrenamatch_seen_group_msgs',
  'entrenamatch_seen_live_users',
  'entrenamatch_seen_live_joins',
  'entrenamatch_sessions',
  'entrenamatch_squads',
  'entrenamatch_reviews',
  'fitvina_messages',
] as const

const SEEN_ID_STORAGE_KEYS = [
  'entrenamatch_seen_chat_msgs',
  'entrenamatch_seen_group_msgs',
] as const

const SEEN_LIST_STORAGE_KEYS = [
  'entrenamatch_seen_live_users',
  'entrenamatch_seen_live_joins',
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

/** Keep the tail of an ID list (assumes append-only / chronological). */
export function pruneIdArray(ids: string[], max: number): string[] {
  if (!Array.isArray(ids) || ids.length <= max) return ids || []
  return ids.slice(-max)
}

export function pruneSeenIdMap(
  raw: Record<string, string[]>,
  maxPerKey = MAX_SEEN_IDS_PER_CHAT,
  maxKeys = MAX_SEEN_CHAT_THREADS
): Record<string, string[]> {
  const keys = Object.keys(raw || {}).slice(-maxKeys)
  const out: Record<string, string[]> = {}
  for (const k of keys) {
    const pruned = pruneIdArray(raw[k] || [], maxPerKey)
    if (pruned.length > 0) out[k] = pruned
  }
  return out
}

export function pruneStringIdList(ids: string[], max = MAX_SEEN_STRING_IDS): string[] {
  return pruneIdArray(ids, max)
}

/** Load a persisted string-id list into a Set (sync, safe for ref init before effects). */
export function loadPersistedStringIdSet(key: string): Set<string> {
  if (typeof localStorage === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(pruneStringIdList(parsed))
  } catch {
    return new Set()
  }
}

/** Load per-thread seen message ids (sync, safe for ref init before effects). */
export function loadPersistedSeenIdMap(key: string): Record<string, Set<string>> {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const parsed = pruneSeenIdMap(JSON.parse(raw))
    const out: Record<string, Set<string>> = {}
    for (const k of Object.keys(parsed)) {
      out[k] = new Set(parsed[k])
    }
    return out
  } catch {
    return {}
  }
}

export function loadPersistedRedSyncState(): Record<string, string | null> {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(PREV_RED_SYNC_STATE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object') return {}
    const keys = Object.keys(parsed).slice(-MAX_PERSISTED_RED_SYNC_ENTRIES)
    const out: Record<string, string | null> = {}
    for (const k of keys) {
      const v = parsed[k]
      out[k] = typeof v === 'string' ? v : v == null ? null : null
    }
    return out
  } catch {
    return {}
  }
}

export function savePersistedRedSyncState(state: Record<string, string | null>): void {
  if (typeof localStorage === 'undefined') return
  try {
    const keys = Object.keys(state).slice(-MAX_PERSISTED_RED_SYNC_ENTRIES)
    const trimmed: Record<string, string | null> = {}
    for (const k of keys) trimmed[k] = state[k] ?? null
    localStorage.setItem(PREV_RED_SYNC_STATE_KEY, JSON.stringify(trimmed))
  } catch {
    reclaimLocalStorageSpace('soft')
  }
}

/** Trim in-memory Set by dropping oldest entries (insertion order). */
export function trimSetToMax<T>(set: Set<T>, max: number): void {
  if (set.size <= max) return
  const excess = set.size - max
  const iter = set.values()
  for (let i = 0; i < excess; i++) {
    const v = iter.next().value
    if (v !== undefined) set.delete(v)
  }
}

function pruneSeenLocalStorageKeys(): boolean {
  if (typeof localStorage === 'undefined') return false
  const before = estimateLocalStorageBytes()
  let changed = false

  for (const key of SEEN_ID_STORAGE_KEYS) {
    try {
      const raw = safeGetJSON<Record<string, string[]>>(key)
      if (!raw) continue
      const pruned = pruneSeenIdMap(raw)
      const beforeLen = JSON.stringify(raw).length
      const afterLen = JSON.stringify(pruned).length
      if (afterLen < beforeLen) {
        localStorage.setItem(key, JSON.stringify(pruned))
        changed = true
      }
    } catch {
      try {
        localStorage.removeItem(key)
        changed = true
      } catch {
        /* ignore */
      }
    }
  }

  for (const key of SEEN_LIST_STORAGE_KEYS) {
    try {
      const raw = safeGetJSON<string[]>(key)
      if (!Array.isArray(raw)) continue
      const pruned = pruneStringIdList(raw)
      if (pruned.length < raw.length) {
        localStorage.setItem(key, JSON.stringify(pruned))
        changed = true
      }
    } catch {
      try {
        localStorage.removeItem(key)
        changed = true
      } catch {
        /* ignore */
      }
    }
  }

  return changed || estimateLocalStorageBytes() < before
}

/**
 * Free localStorage so Firestore can persist offline mutations (chat, writes).
 * soft — app caches only; hard — also Firestore overlay keys (+ mutations as last resort).
 */
export function reclaimLocalStorageSpace(level: 'soft' | 'hard' = 'soft'): boolean {
  if (typeof localStorage === 'undefined') return false
  const before = estimateLocalStorageBytes()
  pruneSeenLocalStorageKeys()
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
    const bytes = estimateLocalStorageBytes()
    pruneSeenLocalStorageKeys()
    // Dead weight: full profile snapshots were written but never read.
    localStorage.removeItem('entrenamatch_last_live')
    if (bytes > PROACTIVE_PRUNE_BYTES) {
      reclaimLocalStorageSpace(bytes > SOFT_LIMIT_BYTES ? 'hard' : 'soft')
    }
  } catch {
    /* ignore */
  }
}

let quotaGuardInstalled = false
let lastQuotaToastAt = 0
const QUOTA_TOAST_COOLDOWN_MS = 3 * 60 * 1000

/** Catch Firestore mutation quota failures so chat does not spam uncaught rejections. */
export function installStorageQuotaGuard(): void {
  if (quotaGuardInstalled || typeof window === 'undefined') return
  quotaGuardInstalled = true

  window.addEventListener('unhandledrejection', (event) => {
    if (!isQuotaError(event.reason)) return
    const msg = String((event.reason as { message?: string })?.message || event.reason || '')
    const firestoreRelated =
      msg.includes('firestore') || msg.includes('setItem') || msg.includes('Storage')

    const before = estimateLocalStorageBytes()
    reclaimLocalStorageSpace(firestoreRelated ? 'hard' : 'soft')
    event.preventDefault()

    const after = estimateLocalStorageBytes()
    const now = Date.now()
    if (now - lastQuotaToastAt < QUOTA_TOAST_COOLDOWN_MS) return
    if (after < before * 0.85 && after < SOFT_LIMIT_BYTES) return

    lastQuotaToastAt = now
    import('sonner')
      .then(({ toast }) => {
        toast.warning('Espacio del navegador casi lleno', {
          description:
            'Liberamos caché local automáticamente. Si algo falla, recarga la página o borra datos del sitio en ajustes.',
          duration: 5000,
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
