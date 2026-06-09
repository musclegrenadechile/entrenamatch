import { normalizeCity } from '../services/localNetwork'

/** Open beta pilot — Viña del Mar metro + Santiago (orden 4). */
export const PILOT_CITY_OPTIONS = [
  { label: 'Viña del Mar', norm: 'vina del mar' },
  { label: 'Valparaíso', norm: 'valparaiso' },
  { label: 'Santiago', norm: 'santiago' },
  { label: 'Concon', norm: 'concon' },
] as const

export const PILOT_CITY_NORMS = PILOT_CITY_OPTIONS.map((c) => c.norm)

export const PILOT_TARGET_MAU_MIN = 50
export const PILOT_TARGET_MAU_MAX = 200

export const PILOT_PROGRAM_TITLE = 'Piloto Viña × Santiago'

export function isOpenPilotCity(city?: string | null): boolean {
  const norm = normalizeCity(city)
  return (PILOT_CITY_NORMS as readonly string[]).includes(norm)
}

export function pilotCityLabel(city?: string | null): string | null {
  const norm = normalizeCity(city)
  const hit = PILOT_CITY_OPTIONS.find((c) => c.norm === norm)
  return hit?.label ?? (norm ? city?.trim() || null : null)
}
