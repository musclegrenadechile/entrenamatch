import { normalizeCity } from '../services/localNetwork'
import { CHILE_CITY_LEGACY_ALIASES, CHILE_REGISTRATION_CITIES } from './chileCities'

export type RegistrationCityOption = {
  label: string
  norm: string
  country: string
  lat: number
  lng: number
  /** Chile: región para agrupar en el selector de registro */
  region?: string
}

/** Países disponibles al crear o editar perfil. */
export const REGISTRATION_COUNTRIES = [
  'Chile',
  'Perú',
  'México',
  'Estados Unidos',
] as const

export type RegistrationCountry = (typeof REGISTRATION_COUNTRIES)[number]

/** Ciudades con piloto activo (métricas, cohort, strip) — costa central + Santiago. */
export const PILOT_LAUNCH_CITY_NORMS = [
  'vina del mar',
  'valparaiso',
  'santiago',
  'concon',
] as const

const OTHER_COUNTRY_CITIES: readonly RegistrationCityOption[] = [
  { label: 'Lima', norm: 'lima', country: 'Perú', lat: -12.0464, lng: -77.0428 },
  { label: 'Arequipa', norm: 'arequipa', country: 'Perú', lat: -16.409, lng: -71.5375 },
  { label: 'Cusco', norm: 'cusco', country: 'Perú', lat: -13.5319, lng: -71.9675 },
  { label: 'Ciudad de México', norm: 'ciudad de mexico', country: 'México', lat: 19.4326, lng: -99.1332 },
  { label: 'Guadalajara', norm: 'guadalajara', country: 'México', lat: 20.6597, lng: -103.3496 },
  { label: 'Monterrey', norm: 'monterrey', country: 'México', lat: 25.6866, lng: -100.3161 },
  { label: 'Miami', norm: 'miami', country: 'Estados Unidos', lat: 25.7617, lng: -80.1918 },
  { label: 'Los Ángeles', norm: 'los angeles', country: 'Estados Unidos', lat: 34.0522, lng: -118.2437 },
  { label: 'Nueva York', norm: 'nueva york', country: 'Estados Unidos', lat: 40.7128, lng: -74.006 },
] as const

export const REGISTRATION_CITY_OPTIONS: readonly RegistrationCityOption[] = [
  ...CHILE_REGISTRATION_CITIES,
  ...OTHER_COUNTRY_CITIES,
] as const

/** @deprecated Use PILOT_LAUNCH_CITY_NORMS — métricas admin solo piloto activo. */
export const PILOT_CITY_OPTIONS = REGISTRATION_CITY_OPTIONS.filter((c) =>
  (PILOT_LAUNCH_CITY_NORMS as readonly string[]).includes(c.norm)
).map(({ label, norm }) => ({ label, norm }))

export const PILOT_CITY_NORMS = [...PILOT_LAUNCH_CITY_NORMS] as const

export const PILOT_TARGET_MAU_MIN = 50
export const PILOT_TARGET_MAU_MAX = 200

export const PILOT_PROGRAM_TITLE = 'Lanzamiento Chile · Perú · México · USA'

export const REGISTRATION_REGION_HINT =
  'Elige tu país y ciudad para aparecer en Explorar y el mapa LIVE de tu zona.'

export function getRegistrationCitiesForCountry(country: string): RegistrationCityOption[] {
  return REGISTRATION_CITY_OPTIONS.filter((c) => c.country === country)
}

export function getRegistrationCityByLabel(label: string): RegistrationCityOption | undefined {
  const trimmed = (label || '').trim()
  if (!trimmed) return undefined
  const exact = REGISTRATION_CITY_OPTIONS.find((c) => c.label === trimmed)
  if (exact) return exact
  const norm = normalizeCity(trimmed)
  const byNorm = REGISTRATION_CITY_OPTIONS.find((c) => c.norm === norm)
  if (byNorm) return byNorm
  const legacyLabel = CHILE_CITY_LEGACY_ALIASES[norm]
  if (legacyLabel) {
    return REGISTRATION_CITY_OPTIONS.find((c) => c.label === legacyLabel)
  }
  return undefined
}

/** Any city available at registration (all Chile communes in list + other countries). */
export function isRegistrationCity(city?: string | null): boolean {
  return resolveRegistrationCity(city) !== null
}

/** Resolve city from label or normalized form — for Firestore writes and discovery. */
export function resolveRegistrationCity(city?: string | null): RegistrationCityOption | null {
  if (!city?.trim()) return null
  return getRegistrationCityByLabel(city) ?? null
}

export function canonicalProfileLocation(
  city?: string | null,
  country?: string | null,
  coords?: { lat?: number; lng?: number } | null
): { city: string; country: string; lat: number; lng: number } {
  const hit = resolveRegistrationCity(city)
  if (hit) {
    return {
      city: hit.label,
      country: hit.country,
      lat: coords?.lat ?? hit.lat,
      lng: coords?.lng ?? hit.lng,
    }
  }
  const fallback = REGISTRATION_CITY_OPTIONS[0]
  const trimmedCity = (city || '').trim()
  const trimmedCountry = (country || '').trim()
  return {
    city: trimmedCity || fallback.label,
    country: trimmedCountry || fallback.country,
    lat: coords?.lat ?? fallback.lat,
    lng: coords?.lng ?? fallback.lng,
  }
}

export function getDefaultCityForCountry(country: string): RegistrationCityOption {
  if (country === 'Chile') {
    return (
      REGISTRATION_CITY_OPTIONS.find((c) => c.norm === 'vina del mar') ||
      getRegistrationCitiesForCountry(country)[0] ||
      REGISTRATION_CITY_OPTIONS[0]
    )
  }
  return getRegistrationCitiesForCountry(country)[0] ?? REGISTRATION_CITY_OPTIONS[0]
}

export function applyRegistrationCitySelection(cityLabel: string): {
  city: string
  country: string
  lat: number
  lng: number
} {
  const hit = resolveRegistrationCity(cityLabel)
  if (hit) {
    return { city: hit.label, country: hit.country, lat: hit.lat, lng: hit.lng }
  }
  const fallback = REGISTRATION_CITY_OPTIONS[0]
  return {
    city: cityLabel?.trim() || fallback.label,
    country: fallback.country,
    lat: fallback.lat,
    lng: fallback.lng,
  }
}

export function applyRegistrationCountrySelection(country: string): {
  country: string
  city: string
  lat: number
  lng: number
} {
  const first = getDefaultCityForCountry(country)
  return {
    country: first.country,
    city: first.label,
    lat: first.lat,
    lng: first.lng,
  }
}

export function isOpenPilotCity(city?: string | null): boolean {
  const norm = normalizeCity(city)
  return (PILOT_LAUNCH_CITY_NORMS as readonly string[]).includes(norm)
}

export function pilotCityLabel(city?: string | null): string | null {
  const norm = normalizeCity(city)
  const hit = REGISTRATION_CITY_OPTIONS.find((c) => c.norm === norm)
  return hit?.label ?? (norm ? city?.trim() || null : null)
}
