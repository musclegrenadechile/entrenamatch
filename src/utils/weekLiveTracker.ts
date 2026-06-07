/** Tracks which calendar days the user trained live (≥20 min) — one simple retention metric. */

const STORAGE_PREFIX = 'entrenamatch_week_live_'
const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const

export function toLocalDateStr(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getMondayOfWeek(reference = new Date()): Date {
  const d = new Date(reference)
  const dow = d.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeekKey(reference = new Date()): string {
  return toLocalDateStr(getMondayOfWeek(reference))
}

export function getWeekDates(reference = new Date()): Date[] {
  const mon = getMondayOfWeek(reference)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d
  })
}

export function getWeekDayLabels(): readonly string[] {
  return DAY_LABELS
}

function readStore(userId: string): Record<string, string[]> {
  if (!userId || typeof localStorage === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_PREFIX + userId) || '{}')
  } catch {
    return {}
  }
}

function writeStore(userId: string, data: Record<string, string[]>) {
  if (!userId || typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(data))
}

export function loadWeekLiveDays(userId: string, reference = new Date()): string[] {
  const weekKey = getWeekKey(reference)
  const store = readStore(userId)
  return store[weekKey] || []
}

/** Mark today (or dateStr) as a training day for the current week. Returns updated list. */
export function recordWeekLiveDay(userId: string, dateStr = toLocalDateStr()): string[] {
  const weekKey = getWeekKey()
  const store = readStore(userId)
  const days = new Set(store[weekKey] || [])
  days.add(dateStr)
  const next = Array.from(days).sort()
  store[weekKey] = next
  // Keep last 8 weeks max
  const keys = Object.keys(store).sort().slice(-8)
  const trimmed: Record<string, string[]> = {}
  keys.forEach((k) => {
    trimmed[k] = store[k]
  })
  writeStore(userId, trimmed)
  return next
}

export type WeekDayStatus = {
  label: string
  dateStr: string
  trained: boolean
  isToday: boolean
}

export function buildWeekDayStatuses(
  trainedDateStrs: string[],
  reference = new Date()
): WeekDayStatus[] {
  const today = toLocalDateStr(reference)
  const trained = new Set(trainedDateStrs)
  return getWeekDates(reference).map((d, i) => {
    const dateStr = toLocalDateStr(d)
    return {
      label: DAY_LABELS[i],
      dateStr,
      trained: trained.has(dateStr),
      isToday: dateStr === today,
    }
  })
}

export const MIN_LIVE_MINUTES_FOR_WEEK_DAY = 20
