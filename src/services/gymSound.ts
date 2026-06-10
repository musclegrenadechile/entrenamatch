/**
 * GymSound — unified public display (Spotify + YouTube Music anthem).
 */

import type { GymSoundAnthem, GymSoundDisplay, Profile } from '../types'
import { getPublicSpotifyNowPlaying } from './spotify'

const ANTHEM_MAX_AGE_MS = 24 * 60 * 60_000

export function getPublicGymSoundAnthem(
  profile: {
    trainingNow?: boolean
    spotifyShareLive?: boolean
    gymSoundAnthem?: GymSoundAnthem
  } | null | undefined
): GymSoundAnthem | undefined {
  if (!profile?.trainingNow || !profile.spotifyShareLive) return undefined
  const anthem = profile.gymSoundAnthem
  if (!anthem?.trackName || !anthem.trackUrl) return undefined
  if (anthem.updatedAt && Date.now() - anthem.updatedAt > ANTHEM_MAX_AGE_MS) return undefined
  return anthem
}

export function anthemToDisplay(anthem: GymSoundAnthem): GymSoundDisplay {
  return {
    trackName: anthem.trackName,
    artistName: anthem.artistName || (anthem.provider === 'youtube-music' ? 'YouTube Music' : 'YouTube'),
    albumArtUrl: anthem.albumArtUrl,
    trackUrl: anthem.trackUrl,
    isPlaying: true,
    updatedAt: anthem.updatedAt,
    provider: anthem.provider,
  }
}

/** Spotify first; manual YouTube anthem as fallback. */
export function getPublicGymSound(
  profile: Pick<Profile, 'trainingNow' | 'spotifyShareLive' | 'spotifyNowPlaying' | 'gymSoundAnthem'> | null | undefined
): GymSoundDisplay | undefined {
  const spotify = getPublicSpotifyNowPlaying(profile)
  if (spotify) return { ...spotify, provider: 'spotify' }

  const anthem = getPublicGymSoundAnthem(profile)
  if (!anthem) return undefined
  return anthemToDisplay(anthem)
}
