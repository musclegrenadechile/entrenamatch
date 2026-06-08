/** Default search radius for sparse Chilean metros (fase 185). */
export const SPARSE_CITY_DEFAULT_KM = 50

const LEGACY_DEFAULT_KM = 25

/** Bump legacy 25 km saved filters to 50 km once. */
export function migrateLegacyMaxDistanceKm(km: number): number {
  if (km === LEGACY_DEFAULT_KM) return SPARSE_CITY_DEFAULT_KM
  return km
}

export function suggestedSquadName(city?: string | null): string {
  const label = (city || 'Viña del Mar').trim()
  return `Squad ${label}`
}

export function feedTemplatePost(city?: string | null): string {
  const label = (city || 'mi ciudad').trim()
  return `¡Hola desde ${label}! Entrenando hoy — ¿quién se suma? 💪`
}

export function buildInviteLink(referralCode: string): string {
  const base =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://musclegrenadechile.github.io/entrenamatch/'
  return `${base}?ref=${encodeURIComponent(referralCode)}`
}
