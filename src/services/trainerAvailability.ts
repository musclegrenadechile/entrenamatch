/**
 * EntrenaCoach — disponibilidad semanal + paquetes multi-sesión.
 */

import type { TrainerAvailabilitySlot, TrainerProfile, TrainerSessionPackage } from '../types'

export const DOW_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const

export function timeToMin(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function minToTime(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatAvailabilitySlot(slot: TrainerAvailabilitySlot): string {
  return `${DOW_LABELS[slot.dow]} ${minToTime(slot.startMin)}–${minToTime(slot.endMin)}`
}

/** Sin slots configurados = disponible siempre. */
export function isWithinAvailability(trainer: TrainerProfile, scheduledAt: number): boolean {
  const slots = trainer.availabilitySlots
  if (!slots?.length) return true

  const d = new Date(scheduledAt)
  const dow = d.getDay()
  const startMin = d.getHours() * 60 + d.getMinutes()
  const duration = trainer.sessionDurationMin || 60
  const endMin = startMin + duration

  return slots.some(
    (s) => s.dow === dow && startMin >= s.startMin && endMin <= s.endMin
  )
}

export function calcBookingPrice(
  trainer: TrainerProfile,
  pkg: TrainerSessionPackage | null | undefined
): {
  sessionCount: number
  unitPriceClp: number
  totalPriceClp: number
  discountPercent: number
  packageId?: string
} {
  const durationMin = trainer.sessionDurationMin || 60
  const unitPriceClp = Math.round((trainer.hourlyRateClp * durationMin) / 60)
  if (!pkg || pkg.sessions <= 1) {
    return {
      sessionCount: 1,
      unitPriceClp,
      totalPriceClp: unitPriceClp,
      discountPercent: 0,
    }
  }
  const discountPercent = Math.min(50, Math.max(0, pkg.discountPercent))
  const totalPriceClp = Math.round(
    unitPriceClp * pkg.sessions * (1 - discountPercent / 100)
  )
  return {
    sessionCount: pkg.sessions,
    unitPriceClp,
    totalPriceClp,
    discountPercent,
    packageId: pkg.id,
  }
}

export function formatPackageLabel(pkg: TrainerSessionPackage): string {
  const label = pkg.label?.trim()
  if (label) return label
  return `${pkg.sessions} sesiones · −${pkg.discountPercent}%`
}

export const PACKAGE_PRESETS: Omit<TrainerSessionPackage, 'id'>[] = [
  { sessions: 3, discountPercent: 10, label: 'Pack 3 sesiones' },
  { sessions: 5, discountPercent: 15, label: 'Pack 5 sesiones' },
  { sessions: 10, discountPercent: 20, label: 'Pack 10 sesiones' },
]

export function newPackageId(): string {
  return `pkg_${Date.now().toString(36)}`
}
