/**
 * GymSound P2 — curated gym/city anthems (gamificación regional).
 */

import { normalizeCity } from './localNetwork'
import { openSpotifyUrl } from './workoutPlaylists'

export type CityGymAnthem = {
  id: string
  cityNorm: string
  cityLabel: string
  trackName: string
  artistName: string
  emoji: string
  /** Spotify track or playlist URL */
  spotifyUrl: string
  tagline: string
}

const ANTHEMS: CityGymAnthem[] = [
  {
    id: 'vina-coast',
    cityNorm: 'vina del mar',
    cityLabel: 'Viña del Mar',
    trackName: 'Bzrp Music Sessions #53',
    artistName: 'Bizarrap & Shakira',
    emoji: '🌊',
    spotifyUrl: 'https://open.spotify.com/track/4obzFoUoOSeA4I1em9N8w9',
    tagline: 'Himno costa — zona Valparaíso',
  },
  {
    id: 'valpo-port',
    cityNorm: 'valparaiso',
    cityLabel: 'Valparaíso',
    trackName: 'Latinoamérica',
    artistName: 'Calle 13',
    emoji: '⛵',
    spotifyUrl: 'https://open.spotify.com/track/1pKFFFepdY9fQ10zG5Em0o',
    tagline: 'Puerto y cerros en el derby',
  },
  {
    id: 'santiago-capital',
    cityNorm: 'santiago',
    cityLabel: 'Santiago',
    trackName: 'DÁKITI',
    artistName: 'Bad Bunny & Jhay Cortez',
    emoji: '🏙️',
    spotifyUrl: 'https://open.spotify.com/track/4mvXzo8KqVr9EdhTahaY9R',
    tagline: 'Himno capital — derby RM',
  },
  {
    id: 'concon-beach',
    cityNorm: 'concon',
    cityLabel: 'Concón',
    trackName: 'Tití Me Preguntó',
    artistName: 'Bad Bunny',
    emoji: '🏖️',
    spotifyUrl: 'https://open.spotify.com/track/1IHWl5LamUGEuP4ozKQSXZ',
    tagline: 'Costa norte en vivo',
  },
]

/** Match city string (profile or gym) to a regional anthem. */
export function resolveCityGymAnthem(city?: string | null): CityGymAnthem | null {
  if (!city?.trim()) return null
  const norm = normalizeCity(city)
  return ANTHEMS.find((a) => a.cityNorm === norm) ?? null
}

/** Derby team anthem when user is on home/away side. */
export function resolveDerbyAnthem(
  myTeam: 'home' | 'away' | null
): CityGymAnthem | null {
  if (myTeam === 'home') return ANTHEMS.find((a) => a.id === 'vina-coast') ?? null
  if (myTeam === 'away') return ANTHEMS.find((a) => a.id === 'santiago-capital') ?? null
  return null
}

export async function openCityGymAnthem(anthem: CityGymAnthem): Promise<void> {
  await openSpotifyUrl(anthem.spotifyUrl)
}
