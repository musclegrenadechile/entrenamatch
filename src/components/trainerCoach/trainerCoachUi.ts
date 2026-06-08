import type { TrainerBookingStatus, TrainerSpecialty } from '../../types'

export function trainerInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
}

export function trainerAvatarHue(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h) % 360
}

export const SPECIALTY_UI: Record<
  TrainerSpecialty,
  { emoji: string; accent: string; label: string }
> = {
  fuerza: { emoji: '🏋️', accent: '#6366f1', label: 'Fuerza' },
  hipertrofia: { emoji: '💪', accent: '#8b5cf6', label: 'Hipertrofia' },
  cardio: { emoji: '🏃', accent: '#f97316', label: 'Cardio' },
  funcional: { emoji: '⚡', accent: '#22c55e', label: 'Funcional' },
  crossfit: { emoji: '🔥', accent: '#ef4444', label: 'CrossFit' },
  rehab: { emoji: '🧘', accent: '#06b6d4', label: 'Rehab' },
  nutricion: { emoji: '🥗', accent: '#84cc16', label: 'Nutrición' },
  otro: { emoji: '✨', accent: '#a855f7', label: 'Otro' },
}

export const BOOKING_STATUS_TONE: Record<TrainerBookingStatus, string> = {
  requested: 'amber',
  accepted: 'emerald',
  declined: 'rose',
  in_progress: 'sky',
  completed: 'violet',
  cancelled: 'slate',
  paid_cash: 'lime',
  paid_card: 'lime',
}
