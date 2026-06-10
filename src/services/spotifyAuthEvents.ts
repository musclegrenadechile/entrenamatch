/** Cross-component Spotify OAuth result (native deep link + web redirect). */

export const SPOTIFY_AUTH_EVENT = 'entrenamatch-spotify-auth'

export type SpotifyAuthEventDetail = { ok: boolean; error?: string }

export function notifySpotifyAuthResult(ok: boolean, error?: string): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<SpotifyAuthEventDetail>(SPOTIFY_AUTH_EVENT, { detail: { ok, error } })
  )
}

export function onSpotifyAuthResult(cb: (detail: SpotifyAuthEventDetail) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<SpotifyAuthEventDetail>).detail)
  window.addEventListener(SPOTIFY_AUTH_EVENT, handler)
  return () => window.removeEventListener(SPOTIFY_AUTH_EVENT, handler)
}
