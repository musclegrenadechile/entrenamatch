/**
 * Fase 121 — Sync Hour: ventanas LIVE promocionadas para densidad en piloto.
 * Mar y Jue 19:00–20:00 (hora Chile).
 */

export type SyncHourSlot = {
  day: number
  startHour: number
  endHour: number
  label: string
}

export const SYNC_HOUR_SLOTS: SyncHourSlot[] = [
  { day: 2, startHour: 19, endHour: 20, label: 'Martes 19:00' },
  { day: 4, startHour: 19, endHour: 20, label: 'Jueves 19:00' },
]

export type SyncHourState = {
  active: boolean
  /** Minutos hasta que termine la ventana activa */
  endsInMinutes: number | null
  /** Minutos hasta la próxima ventana (si no está activa) */
  startsInMinutes: number | null
  nextSlotLabel: string | null
  currentSlotLabel: string | null
}

const DAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

function chileClock(now = new Date()): { day: number; minutesSinceMidnight: number } {
  const weekday = now.toLocaleString('en-US', { timeZone: 'America/Santiago', weekday: 'short' })
  const time = now.toLocaleString('en-US', {
    timeZone: 'America/Santiago',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  })
  const [hourStr, minuteStr] = time.split(':')
  const hour = Number(hourStr) || 0
  const minute = Number(minuteStr) || 0
  return { day: DAY_MAP[weekday] ?? 0, minutesSinceMidnight: hour * 60 + minute }
}

function slotStartMinutes(slot: SyncHourSlot): number {
  return slot.startHour * 60
}

function slotEndMinutes(slot: SyncHourSlot): number {
  return slot.endHour * 60
}

/** Minutos desde ahora hasta un instante (día + minutos desde medianoche) en la semana actual o siguiente. */
function minutesUntil(targetDay: number, targetMinutes: number, now: Date): number {
  const { day, minutesSinceMidnight } = chileClock(now)
  let dayDelta = targetDay - day
  if (dayDelta < 0) dayDelta += 7
  if (dayDelta === 0 && targetMinutes <= minutesSinceMidnight) dayDelta = 7
  const minuteDelta =
    dayDelta === 0 ? targetMinutes - minutesSinceMidnight : dayDelta * 24 * 60 + (targetMinutes - minutesSinceMidnight)
  return Math.max(0, minuteDelta)
}

export function getSyncHourState(now = new Date()): SyncHourState {
  const { day, minutesSinceMidnight } = chileClock(now)

  for (const slot of SYNC_HOUR_SLOTS) {
    const start = slotStartMinutes(slot)
    const end = slotEndMinutes(slot)
    if (day === slot.day && minutesSinceMidnight >= start && minutesSinceMidnight < end) {
      return {
        active: true,
        endsInMinutes: end - minutesSinceMidnight,
        startsInMinutes: null,
        nextSlotLabel: null,
        currentSlotLabel: slot.label,
      }
    }
  }

  let nearestMinutes = Infinity
  let nearestLabel: string | null = null

  for (const slot of SYNC_HOUR_SLOTS) {
    const start = slotStartMinutes(slot)
    const delta = minutesUntil(slot.day, start, now)
    if (delta < nearestMinutes) {
      nearestMinutes = delta
      nearestLabel = slot.label
    }
  }

  return {
    active: false,
    endsInMinutes: null,
    startsInMinutes: nearestMinutes === Infinity ? null : nearestMinutes,
    nextSlotLabel: nearestLabel,
    currentSlotLabel: null,
  }
}

/** Muestra banner si está activa o faltan ≤ 90 min para la próxima ventana. */
export function shouldShowSyncHourBanner(now = new Date()): boolean {
  const state = getSyncHourState(now)
  if (state.active) return true
  return state.startsInMinutes != null && state.startsInMinutes <= 90
}

const SYNC_HOUR_NOTIF_PREFIX = 'entrenamatch_sync_hour_notif_'

function syncHourNotifStorageKey(now = new Date()): string | null {
  const state = getSyncHourState(now)
  if (!state.active) return null
  const { day } = chileClock(now)
  return `${SYNC_HOUR_NOTIF_PREFIX}${day}`
}

/** Una notificación por ventana Sync Hour (por dispositivo). */
export function shouldFireSyncHourNotif(now = new Date()): boolean {
  const key = syncHourNotifStorageKey(now)
  if (!key) return false
  try {
    if (localStorage.getItem(key) === '1') return false
    localStorage.setItem(key, '1')
    return true
  } catch {
    return true
  }
}
