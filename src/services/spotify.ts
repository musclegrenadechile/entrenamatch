/**
 * GymSound — Spotify integration (Phase 1 + 2).
 * OAuth PKCE, now playing poll, remote playback control, tokens local only.
 */

import { ensureCapacitorPlugins, getCapacitorBrowser } from '../utils/capacitorRuntimePlugins'
import { safeGetJSON, safeSetJSON } from '../utils/safeLocalStorage'
import { notifySpotifyAuthResult } from './spotifyAuthEvents'
import type { SpotifyNowPlaying } from '../types'

export const SPOTIFY_SCOPES =
  'user-read-currently-playing user-read-playback-state user-modify-playback-state'
export const SPOTIFY_TOKEN_KEY = 'entrenamatch_spotify_tokens'
export const SPOTIFY_PKCE_KEY = 'entrenamatch_spotify_pkce'

export type SpotifyTokens = {
  accessToken: string
  refreshToken?: string
  expiresAt: number
  scope?: string
}

type SpotifyPkceSession = {
  verifier: string
  state: string
  at: number
}

export type SpotifyNowPlayingData = {
  trackName: string
  artistName: string
  albumArtUrl?: string
  trackUrl?: string
  isPlaying: boolean
}

export function isSpotifyConfigured(): boolean {
  return !!getSpotifyClientId()
}

export function getSpotifyClientId(): string | null {
  const id = (import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined)?.trim()
  return id || null
}

export const SPOTIFY_REDIRECT_WEB = 'https://entrenamatch.web.app/'
/** APK — HTTPS callback on Firebase Hosting; returns to app via deep link. */
export const SPOTIFY_REDIRECT_CALLBACK = 'https://entrenamatch.web.app/spotify-callback.html'
export const SPOTIFY_DEEP_LINK_SCHEME = 'com.entrenamatch.app'
export const SPOTIFY_DEEP_LINK_HOST = 'spotify-auth'

export function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
    return !!cap?.isNativePlatform?.()
  } catch {
    return false
  }
}

export function getSpotifyRedirectUri(): string {
  if (typeof window === 'undefined') return SPOTIFY_REDIRECT_WEB

  // Native: always HTTPS callback page (Spotify rejects capacitor:// and http://localhost).
  if (isCapacitorNative()) return SPOTIFY_REDIRECT_CALLBACK

  const { protocol, host, origin } = window.location
  if (protocol === 'http:' && (host === 'localhost' || host.startsWith('127.'))) {
    return `${origin}/`
  }
  if (protocol !== 'https:' && protocol !== 'http:') {
    return SPOTIFY_REDIRECT_WEB
  }
  if (protocol === 'http:' && !host.includes('localhost') && !host.startsWith('127.')) {
    return SPOTIFY_REDIRECT_WEB
  }

  return `${origin}/`
}

export function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(new Uint8Array(digest))
}

function base64UrlEncode(bytes: Uint8Array): string {
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function getStoredSpotifyTokens(): SpotifyTokens | null {
  const parsed = safeGetJSON<SpotifyTokens>(SPOTIFY_TOKEN_KEY)
  if (!parsed?.accessToken || !parsed.expiresAt) return null
  return parsed
}

export function storeSpotifyTokens(tokens: SpotifyTokens): void {
  safeSetJSON(SPOTIFY_TOKEN_KEY, tokens)
}

function removeStorageKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export function clearSpotifyTokens(): void {
  removeStorageKey(SPOTIFY_TOKEN_KEY)
}

export function isSpotifyConnected(): boolean {
  return !!getStoredSpotifyTokens()?.accessToken
}

export function spotifyHasRemoteControlScope(): boolean {
  const scope = getStoredSpotifyTokens()?.scope || ''
  return scope.includes('user-modify-playback-state')
}

export type SpotifyPlaybackState = {
  isPlaying: boolean
  deviceName?: string
  canControl: boolean
  trackName?: string
  artistName?: string
}

export type SpotifyRemoteResult =
  | { ok: true }
  | { ok: false; reason: 'no_device' | 'premium_required' | 'unauthorized' | 'network' }

function storePkceSession(session: SpotifyPkceSession): void {
  safeSetJSON(SPOTIFY_PKCE_KEY, session)
}

function consumePkceSession(expectedState: string): string | null {
  const parsed = safeGetJSON<SpotifyPkceSession>(SPOTIFY_PKCE_KEY)
  removeStorageKey(SPOTIFY_PKCE_KEY)
  if (!parsed?.verifier || parsed.state !== expectedState) return null
  if (Date.now() - parsed.at > 10 * 60_000) return null
  return parsed.verifier
}

export async function buildSpotifyAuthorizeUrlAsync(): Promise<string> {
  const clientId = getSpotifyClientId()
  if (!clientId) throw new Error('Spotify no configurado (VITE_SPOTIFY_CLIENT_ID)')

  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  const state = generateCodeVerifier().slice(0, 16)
  storePkceSession({ verifier, state, at: Date.now() })

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: getSpotifyRedirectUri(),
    scope: SPOTIFY_SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

export async function startSpotifyAuth(): Promise<void> {
  const authorizeUrl = await buildSpotifyAuthorizeUrlAsync()

  if (isCapacitorNative()) {
    await ensureCapacitorPlugins()
    const Browser = getCapacitorBrowser()
    if (!Browser) {
      throw new Error('Plugin Browser no disponible. Actualiza la app e inténtalo de nuevo.')
    }
    if (typeof Browser.addListener === 'function') {
      void Browser.addListener('browserFinished', () => {
        window.setTimeout(() => {
          if (!isSpotifyConnected()) notifySpotifyAuthResult(false, 'browser_closed')
        }, 600)
      })
    }
    await Browser.open({ url: authorizeUrl, presentationStyle: 'fullscreen' })
    notifySpotifyAuthResult(false, 'browser_opened')
    return
  }

  window.location.assign(authorizeUrl)
}

export function parseSpotifyDeepLink(url: string): { code: string; state: string } | null {
  try {
    if (!url.startsWith(`${SPOTIFY_DEEP_LINK_SCHEME}://`)) return null
    const parsed = new URL(url)
    if (parsed.hostname !== SPOTIFY_DEEP_LINK_HOST) return null
    const code = parsed.searchParams.get('code')
    const state = parsed.searchParams.get('state')
    if (!code || !state) return null
    return { code, state }
  } catch {
    return null
  }
}

export async function handleSpotifyDeepLink(url: string): Promise<boolean> {
  const payload = parseSpotifyDeepLink(url)
  if (!payload) return false

  try {
    const Browser = getCapacitorBrowser()
    if (Browser) await Browser.close()
  } catch {
    /* ignore */
  }

  return completeSpotifyAuth(payload.code, payload.state)
}

async function exchangeToken(body: Record<string, string>): Promise<SpotifyTokens> {
  const clientId = getSpotifyClientId()
  if (!clientId) throw new Error('Spotify no configurado')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, ...body }).toString(),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`Spotify token error: ${res.status} ${err}`)
  }

  const data = (await res.json()) as {
    access_token: string
    refresh_token?: string
    expires_in: number
    scope?: string
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 30_000,
    scope: data.scope,
  }
}

export async function completeSpotifyAuth(code: string, state: string): Promise<boolean> {
  const verifier = consumePkceSession(state)
  if (!verifier) return false

  const tokens = await exchangeToken({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getSpotifyRedirectUri(),
    code_verifier: verifier,
  })

  const prev = getStoredSpotifyTokens()
  if (!tokens.refreshToken && prev?.refreshToken) {
    tokens.refreshToken = prev.refreshToken
  }

  storeSpotifyTokens(tokens)
  return true
}

export async function refreshSpotifyTokenIfNeeded(): Promise<string | null> {
  const stored = getStoredSpotifyTokens()
  if (!stored?.accessToken) return null
  if (stored.expiresAt > Date.now()) return stored.accessToken
  if (!stored.refreshToken) {
    clearSpotifyTokens()
    return null
  }

  try {
    const next = await exchangeToken({
      grant_type: 'refresh_token',
      refresh_token: stored.refreshToken,
    })
    next.refreshToken = next.refreshToken || stored.refreshToken
    storeSpotifyTokens(next)
    return next.accessToken
  } catch {
    clearSpotifyTokens()
    return null
  }
}

export async function getValidSpotifyAccessToken(): Promise<string | null> {
  return refreshSpotifyTokenIfNeeded()
}

async function spotifyPlayerRequest(
  accessToken: string,
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<SpotifyRemoteResult> {
  try {
    const res = await fetch(`https://api.spotify.com/v1/me/player${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    if (res.status === 204 || res.status === 202) return { ok: true }
    if (res.status === 401) {
      clearSpotifyTokens()
      return { ok: false, reason: 'unauthorized' }
    }
    if (res.status === 403) return { ok: false, reason: 'premium_required' }
    if (res.status === 404) return { ok: false, reason: 'no_device' }
    if (!res.ok) return { ok: false, reason: 'network' }
    return { ok: true }
  } catch {
    return { ok: false, reason: 'network' }
  }
}

export async function fetchSpotifyPlaybackState(
  accessToken: string
): Promise<SpotifyPlaybackState | null> {
  try {
    const res = await fetch('https://api.spotify.com/v1/me/player', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (res.status === 204 || res.status === 202) {
      return { isPlaying: false, canControl: spotifyHasRemoteControlScope() }
    }
    if (res.status === 401) {
      clearSpotifyTokens()
      return null
    }
    if (!res.ok) return null

    const data = (await res.json()) as {
      is_playing?: boolean
      device?: { name?: string; is_active?: boolean }
      item?: {
        name?: string
        artists?: Array<{ name?: string }>
      }
    }

    return {
      isPlaying: data.is_playing !== false,
      deviceName: data.device?.name,
      canControl: spotifyHasRemoteControlScope(),
      trackName: data.item?.name,
      artistName: (data.item?.artists || []).map((a) => a.name).filter(Boolean).join(', ') || undefined,
    }
  } catch {
    return null
  }
}

export async function spotifyTogglePlayback(accessToken: string, isPlaying: boolean): Promise<SpotifyRemoteResult> {
  return spotifyPlayerRequest(accessToken, 'PUT', isPlaying ? '/pause' : '/play')
}

export async function spotifySkipNext(accessToken: string): Promise<SpotifyRemoteResult> {
  return spotifyPlayerRequest(accessToken, 'POST', '/next')
}

export async function spotifySkipPrevious(accessToken: string): Promise<SpotifyRemoteResult> {
  return spotifyPlayerRequest(accessToken, 'POST', '/previous')
}

export async function fetchSpotifyNowPlaying(
  accessToken: string
): Promise<SpotifyNowPlayingData | null> {
  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (res.status === 204 || res.status === 202) return null
  if (res.status === 401) {
    clearSpotifyTokens()
    return null
  }
  if (!res.ok) return null

  const data = (await res.json()) as {
    is_playing?: boolean
    item?: {
      name?: string
      external_urls?: { spotify?: string }
      album?: { images?: Array<{ url?: string }> }
      artists?: Array<{ name?: string }>
    }
  }

  const item = data.item
  if (!item?.name) return null

  return {
    trackName: item.name,
    artistName: (item.artists || []).map((a) => a.name).filter(Boolean).join(', ') || 'Artista',
    albumArtUrl: item.album?.images?.[0]?.url,
    trackUrl: item.external_urls?.spotify,
    isPlaying: data.is_playing !== false,
  }
}

export function toProfileNowPlaying(data: SpotifyNowPlayingData): SpotifyNowPlaying {
  return {
    trackName: data.trackName,
    artistName: data.artistName,
    albumArtUrl: data.albumArtUrl,
    trackUrl: data.trackUrl,
    isPlaying: data.isPlaying,
    updatedAt: Date.now(),
  }
}

/** Public now playing — only when live + opt-in + fresh. */
export function getPublicSpotifyNowPlaying(
  profile: {
    trainingNow?: boolean
    spotifyShareLive?: boolean
    spotifyNowPlaying?: SpotifyNowPlaying
  } | null | undefined
): SpotifyNowPlaying | undefined {
  if (!profile?.trainingNow || !profile.spotifyShareLive) return undefined
  const np = profile.spotifyNowPlaying
  if (!np?.trackName) return undefined
  if (np.updatedAt && Date.now() - np.updatedAt > 6 * 60_000) return undefined
  return np
}

export function parseSpotifyCallbackFromUrl(url: URL): { code: string; state: string } | null {
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  if (error || !code || !state) return null
  const parsed = safeGetJSON<SpotifyPkceSession>(SPOTIFY_PKCE_KEY)
  if (!parsed || parsed.state !== state) return null
  return { code, state }
}

export function clearSpotifyCallbackFromUrl(): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (!url.searchParams.has('code') && !url.searchParams.has('state')) return
  url.searchParams.delete('code')
  url.searchParams.delete('state')
  url.searchParams.delete('error')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

export function disconnectSpotify(): void {
  clearSpotifyTokens()
  removeStorageKey(SPOTIFY_PKCE_KEY)
}
