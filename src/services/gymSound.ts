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

type GymSoundFields = Pick<Profile, 'spotifyShareLive' | 'spotifyNowPlaying' | 'gymSoundAnthem'>

function pickFresherNowPlaying(
  presence?: Profile['spotifyNowPlaying'],
  profile?: Profile['spotifyNowPlaying']
): Profile['spotifyNowPlaying'] | undefined {
  if (!profile?.trackName) return presence?.trackName ? presence : undefined
  if (!presence?.trackName) return profile
  const pAt = profile.updatedAt ?? 0
  const rAt = presence.updatedAt ?? 0
  return pAt >= rAt ? profile : presence
}

/** Overlay GymSound from profiles onto livePresence rows (presence can lag profile writes). */
export function enrichLiveUsersWithProfileGymSound<T extends { id: string } & GymSoundFields>(
  presenceUsers: T[],
  profileUsers: Array<{ id: string } & GymSoundFields>
): T[] {
  if (!profileUsers.length) return presenceUsers
  const byId = new Map(profileUsers.map((p) => [p.id, p]))
  return presenceUsers.map((u) => {
    const prof = byId.get(u.id)
    if (!prof) return u
    const share = prof.spotifyShareLive === true || u.spotifyShareLive === true
    if (!share) return u
    const spotifyNowPlaying = pickFresherNowPlaying(u.spotifyNowPlaying, prof.spotifyNowPlaying)
    const gymSoundAnthem = prof.gymSoundAnthem?.trackName
      ? prof.gymSoundAnthem
      : u.gymSoundAnthem
    if (
      u.spotifyShareLive === share &&
      u.spotifyNowPlaying === spotifyNowPlaying &&
      u.gymSoundAnthem === gymSoundAnthem
    ) {
      return u
    }
    return {
      ...u,
      spotifyShareLive: true,
      spotifyNowPlaying: share ? spotifyNowPlaying : u.spotifyNowPlaying,
      gymSoundAnthem: share ? gymSoundAnthem : u.gymSoundAnthem,
    }
  })
}
