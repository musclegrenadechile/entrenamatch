/**
 * GymSound — music compatibility for EntrenaSync partners.
 */

import type { GymSoundDisplay, Profile } from '../types'
import { getPublicGymSound } from './gymSound'
import { tracksMatch } from './gymSoundReactions'

export type GymSoundSyncMatch = {
  selfMusic?: GymSoundDisplay
  partnerMusic?: GymSoundDisplay
  sameTrack: boolean
  sameArtist: boolean
  bothSharing: boolean
  label: string
  emoji: string
}

function normArtist(s?: string): string {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim()
}

export function buildGymSoundSyncMatch(
  self: Pick<Profile, 'trainingNow' | 'spotifyShareLive' | 'spotifyNowPlaying' | 'gymSoundAnthem'> | null | undefined,
  partner: Pick<Profile, 'trainingNow' | 'spotifyShareLive' | 'spotifyNowPlaying' | 'gymSoundAnthem'> | null | undefined
): GymSoundSyncMatch | null {
  const selfMusic = getPublicGymSound(self)
  const partnerMusic = getPublicGymSound(partner)
  const bothSharing = !!selfMusic && !!partnerMusic

  if (!selfMusic && !partnerMusic) return null

  const sameTrack = tracksMatch(selfMusic, partnerMusic)
  const sameArtist =
    !!selfMusic?.artistName &&
    !!partnerMusic?.artistName &&
    normArtist(selfMusic.artistName) === normArtist(partnerMusic.artistName)

  let label = 'Música en sync'
  let emoji = '🎵'

  if (sameTrack) {
    label = '¡Misma canción!'
    emoji = '🔥'
  } else if (sameArtist) {
    label = `Mismo artista · ${selfMusic?.artistName || partnerMusic?.artistName}`
    emoji = '💪'
  } else if (bothSharing) {
    label = 'Vibras distintas — comparte playlist'
    emoji = '🎧'
  } else if (selfMusic && !partnerMusic) {
    label = 'Tú compartes música · invítale a conectar'
    emoji = '📡'
  } else {
    label = `${partnerMusic?.artistName || 'Música'} en vivo`
    emoji = '🎵'
  }

  return {
    selfMusic,
    partnerMusic,
    sameTrack,
    sameArtist,
    bothSharing,
    label,
    emoji,
  }
}
