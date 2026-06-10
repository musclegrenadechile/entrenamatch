/**
 * GymSound — curated workout playlists (Spotify deep links, 1 tap).
 */

import { ensureCapacitorPlugins, getCapacitorBrowser } from '../utils/capacitorRuntimePlugins'

export type WorkoutPlaylist = {
  id: string
  label: string
  emoji: string
  /** Spotify playlist URI or HTTPS URL */
  spotifyUrl: string
  vibe: 'fuerza' | 'cardio' | 'hiit' | 'focus' | 'party'
}

/** Public Spotify playlists — stable editorial picks. */
export const WORKOUT_PLAYLISTS: WorkoutPlaylist[] = [
  {
    id: 'beast-mode',
    label: 'Beast Mode',
    emoji: '💪',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX76Wl6C0bZqD',
    vibe: 'fuerza',
  },
  {
    id: 'cardio',
    label: 'Cardio',
    emoji: '🏃',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX70RN3iW0MYm',
    vibe: 'cardio',
  },
  {
    id: 'hiit',
    label: 'HIIT',
    emoji: '⚡',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX70RN3iW0MYm',
    vibe: 'hiit',
  },
  {
    id: 'focus',
    label: 'Focus',
    emoji: '🎯',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    vibe: 'focus',
  },
  {
    id: 'party',
    label: 'Party',
    emoji: '🔥',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',
    vibe: 'party',
  },
]

export function toSpotifyDeepLink(url: string): string {
  const trimmed = url.trim()
  if (trimmed.startsWith('spotify:')) return trimmed
  const m = trimmed.match(/open\.spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/)
  if (m) return `spotify:${m[1]}:${m[2]}`
  return trimmed
}

/** Open playlist in Spotify app (native) or browser tab (web). */
export async function openSpotifyUrl(url: string): Promise<void> {
  const deep = toSpotifyDeepLink(url)
  const webUrl = deep.startsWith('spotify:')
    ? `https://open.spotify.com/${deep.split(':')[1]}/${deep.split(':')[2]}`
    : url

  await ensureCapacitorPlugins()
  const Browser = getCapacitorBrowser()
  if (Browser) {
    try {
      await Browser.open({ url: deep, presentationStyle: 'fullscreen' })
      return
    } catch {
      try {
        await Browser.open({ url: webUrl, presentationStyle: 'fullscreen' })
        return
      } catch {
        /* fall through */
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.open(webUrl, '_blank', 'noopener,noreferrer')
  }
}

export async function openWorkoutPlaylist(playlist: WorkoutPlaylist): Promise<void> {
  await openSpotifyUrl(playlist.spotifyUrl)
}
