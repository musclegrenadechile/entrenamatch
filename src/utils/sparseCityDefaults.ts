import { LEGACY_GITHUB_HOST, PUBLIC_APP_URL, SHAREABLE_APP_HOSTS } from '../constants'

/** Default search radius for sparse Chilean metros (fase 185). */
export const SPARSE_CITY_DEFAULT_KM = 50

function isShareableHost(hostname: string): boolean {
  return SHAREABLE_APP_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`))
}

function isLegacyGithubHost(hostname: string): boolean {
  return hostname === LEGACY_GITHUB_HOST || hostname.endsWith(`.${LEGACY_GITHUB_HOST}`)
}

/** Base URL safe to paste in WhatsApp/IG — always Firebase (official), never localhost/GH. */
export function resolveShareableAppBase(): string {
  const envUrl =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_APP_URL
  if (typeof envUrl === 'string' && envUrl.startsWith('http')) {
    return envUrl.replace(/\/$/, '')
  }

  if (typeof window === 'undefined') {
    return PUBLIC_APP_URL
  }

  const { hostname, origin, pathname } = window.location
  if (isLegacyGithubHost(hostname)) {
    return PUBLIC_APP_URL
  }
  if (isShareableHost(hostname)) {
    const path = pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') || ''
    return `${origin}${path}`
  }

  return PUBLIC_APP_URL
}

/** Host (+ GitHub path) for story watermarks — never localhost. */
export function shareableAppHostname(): string {
  const base = resolveShareableAppBase()
  try {
    const u = new URL(base)
    const path = u.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '')
    if (path && path !== '/') return `${u.hostname}${path}`
    return u.hostname
  } catch {
    return 'entrenamatch.web.app'
  }
}

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
  const base = resolveShareableAppBase()
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}ref=${encodeURIComponent(referralCode)}`
}

/** Fase 121 — enlace con contexto de gym partner (QR en recepción). */
export function buildGymInviteLink(
  referralCode: string,
  gym?: { id?: string; name?: string } | null
): string {
  const link = buildInviteLink(referralCode)
  if (!gym?.id && !gym?.name) return link
  try {
    const u = new URL(link)
    if (gym.id) u.searchParams.set('gym', gym.id)
    if (gym.name) u.searchParams.set('gymName', gym.name.slice(0, 48))
    return u.toString()
  } catch {
    return link
  }
}

const NON_SHAREABLE_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0'])

/** Rewrites localhost/file URLs to the public app origin (keeps ?ref= when present). */
export function sanitizeShareUrl(url?: string): string {
  const fallback = resolveShareableAppBase()
  const trimmed = url?.trim()
  if (!trimmed) return fallback
  try {
    const parsed = new URL(trimmed)
    if (
      parsed.protocol === 'file:' ||
      NON_SHAREABLE_HOSTS.has(parsed.hostname) ||
      isLegacyGithubHost(parsed.hostname)
    ) {
      const ref = parsed.searchParams.get('ref')
      return ref ? buildInviteLink(ref) : fallback
    }
    return trimmed
  } catch {
    return fallback
  }
}
