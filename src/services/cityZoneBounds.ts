import { normalizeCity } from './localNetwork'

export type CityZone = {
  label: string
  center: { lat: number; lng: number }
  /** Challenge zone radius in meters */
  radiusM: number
}

/** Approximate hex polygon for map overlay (fase 85). */
export function cityZonePolygonLatLngs(
  zone: CityZone,
  sides = 6
): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
    const dLat = (zone.radiusM / 111_000) * Math.cos(angle)
    const dLng =
      (zone.radiusM / (111_000 * Math.cos((zone.center.lat * Math.PI) / 180))) *
      Math.sin(angle)
    pts.push([zone.center.lat + dLat, zone.center.lng + dLng])
  }
  return pts
}

/** Approximate city challenge zones for map overlay (fase 112 / 200). */
export const CITY_ZONES: Record<string, CityZone> = {
  'vina del mar': {
    label: 'Viña del Mar',
    center: { lat: -33.024, lng: -71.552 },
    radiusM: 7500,
  },
  valparaiso: {
    label: 'Valparaíso',
    center: { lat: -33.047, lng: -71.612 },
    radiusM: 8000,
  },
  santiago: {
    label: 'Santiago',
    center: { lat: -33.448, lng: -70.669 },
    radiusM: 12000,
  },
  concon: {
    label: 'Concon',
    center: { lat: -32.923, lng: -71.522 },
    radiusM: 5500,
  },
  /** Derby regional overlay — Región de Valparaíso */
  'region valparaiso': {
    label: 'Región de Valparaíso',
    center: { lat: -33.08, lng: -71.55 },
    radiusM: 58000,
  },
  /** Derby regional overlay — Región Metropolitana */
  'region metropolitana': {
    label: 'Región Metropolitana',
    center: { lat: -33.456, lng: -70.648 },
    radiusM: 72000,
  },
}

export function resolveCityZone(cityLabel?: string | null): CityZone | null {
  if (!cityLabel?.trim()) return null
  const key = normalizeCity(cityLabel)
  return CITY_ZONES[key] ?? null
}

/** Derby map zones — Valparaíso (región) vs Santiago (solo comuna). */
export function resolveDerbyMapZone(team: 'home' | 'away'): CityZone {
  return team === 'home'
    ? CITY_ZONES['region valparaiso']
    : CITY_ZONES.santiago
}

/** @deprecated Use resolveDerbyMapZone */
export function resolveDerbyRegionZone(team: 'home' | 'away'): CityZone {
  return resolveDerbyMapZone(team)
}
