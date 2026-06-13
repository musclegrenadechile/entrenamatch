import { normalizeCity } from '../services/localNetwork'

export type RegistrationCityOption = {
  label: string
  norm: string
  country: string
  lat: number
  lng: number
}

/** Países disponibles al crear o editar perfil. */
export const REGISTRATION_COUNTRIES = [
  'Chile',
  'Perú',
  'México',
  'Estados Unidos',
] as const

export type RegistrationCountry = (typeof REGISTRATION_COUNTRIES)[number]

export const REGISTRATION_CITY_OPTIONS: readonly RegistrationCityOption[] = [
  { label: 'Viña del Mar', norm: 'vina del mar', country: 'Chile', lat: -33.0153, lng: -71.5528 },
  { label: 'Valparaíso', norm: 'valparaiso', country: 'Chile', lat: -33.0472, lng: -71.6127 },
  { label: 'Santiago', norm: 'santiago', country: 'Chile', lat: -33.4489, lng: -70.6693 },
  { label: 'Concon', norm: 'concon', country: 'Chile', lat: -32.923, lng: -71.522 },
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

/** @deprecated Use REGISTRATION_CITY_OPTIONS — kept for métricas admin y tests legacy. */
export const PILOT_CITY_OPTIONS = REGISTRATION_CITY_OPTIONS.map(({ label, norm }) => ({ label, norm }))

export const PILOT_CITY_NORMS = REGISTRATION_CITY_OPTIONS.map((c) => c.norm)

export const PILOT_TARGET_MAU_MIN = 50
export const PILOT_TARGET_MAU_MAX = 200

export const PILOT_PROGRAM_TITLE = 'Lanzamiento Chile · Perú · México · USA'

export const REGISTRATION_REGION_HINT =
  'Elige tu país y ciudad para aparecer en Explorar y el mapa LIVE de tu zona.'

export function getRegistrationCitiesForCountry(country: string): RegistrationCityOption[] {
  return REGISTRATION_CITY_OPTIONS.filter((c) => c.country === country)
}

export function getRegistrationCityByLabel(label: string): RegistrationCityOption | undefined {
  return REGISTRATION_CITY_OPTIONS.find((c) => c.label === label)
}

export function getDefaultCityForCountry(country: string): RegistrationCityOption {
  return getRegistrationCitiesForCountry(country)[0] ?? REGISTRATION_CITY_OPTIONS[0]
}

export function applyRegistrationCitySelection(cityLabel: string): {
  city: string
  country: string
  lat: number
  lng: number
} {
  const hit = getRegistrationCityByLabel(cityLabel)
  if (hit) {
    return { city: hit.label, country: hit.country, lat: hit.lat, lng: hit.lng }
  }
  const fallback = REGISTRATION_CITY_OPTIONS[0]
  return {
    city: cityLabel || fallback.label,
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
  return (PILOT_CITY_NORMS as readonly string[]).includes(norm)
}

export function pilotCityLabel(city?: string | null): string | null {
  const norm = normalizeCity(city)
  const hit = REGISTRATION_CITY_OPTIONS.find((c) => c.norm === norm)
  return hit?.label ?? (norm ? city?.trim() || null : null)
}
