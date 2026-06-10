/**
 * GymSound — quick reactions to live music (🔥 / 💪 / misma playlist).
 */

import { toast } from 'sonner'
import type { GymSoundDisplay } from '../types'
import { openSpotifyUrl } from './workoutPlaylists'

export type GymSoundReactionId = 'fire' | 'muscle' | 'same_playlist'

export type GymSoundReaction = {
  id: GymSoundReactionId
  emoji: string
  label: string
}

export const GYM_SOUND_REACTIONS: GymSoundReaction[] = [
  { id: 'fire', emoji: '🔥', label: 'Fuego' },
  { id: 'muscle', emoji: '💪', label: 'Fuerza' },
  { id: 'same_playlist', emoji: '🎵', label: 'Misma playlist' },
]

export type MusicReactionTarget = {
  userId: string
  userName: string
  lat?: number
  lng?: number
  nowPlaying?: GymSoundDisplay | null
}

export type SyncRipple = {
  id: string
  lat: number
  lng: number
  label?: string
  intensity?: number
}

export function tracksMatch(
  a?: { trackName?: string; artistName?: string } | null,
  b?: { trackName?: string; artistName?: string } | null
): boolean {
  if (!a?.trackName || !b?.trackName) return false
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()
  return norm(a.trackName) === norm(b.trackName) && norm(a.artistName || '') === norm(b.artistName || '')
}

export function sendGymSoundReaction(
  reactionId: GymSoundReactionId,
  target: MusicReactionTarget,
  options: {
    selfName?: string
    selfNowPlaying?: GymSoundDisplay | null
    setSyncRipples?: (updater: SyncRipple[] | ((prev: SyncRipple[]) => SyncRipple[])) => void
    onHaptic?: () => void
  } = {}
): void {
  const reaction = GYM_SOUND_REACTIONS.find((r) => r.id === reactionId)
  if (!reaction) return

  const first = (target.userName || 'Atleta').split(' ')[0]
  options.onHaptic?.()

  if (reactionId === 'same_playlist') {
    const same = tracksMatch(options.selfNowPlaying, target.nowPlaying)
    if (same) {
      toast.success(`¡Misma canción que ${first}! 🎵`, { duration: 3500 })
    } else if (target.nowPlaying?.trackUrl) {
      toast.info(`Abriendo lo que escucha ${first}…`, { duration: 2500 })
      void openSpotifyUrl(target.nowPlaying.trackUrl)
    } else {
      toast(`🎵 Buena vibra con ${first}`, { duration: 3000 })
    }
  } else {
    toast(`${reaction.emoji} ${reaction.label} → ${first}`, { duration: 2500 })
  }

  const lat = target.lat
  const lng = target.lng
  if (options.setSyncRipples && Number.isFinite(lat) && Number.isFinite(lng)) {
    const rippleId = `music-${Date.now()}`
    const trackHint = target.nowPlaying?.trackName
      ? ` · ${target.nowPlaying.trackName}`
      : ''
    options.setSyncRipples((prev) => [
      ...prev,
      {
        id: rippleId,
        lat: lat!,
        lng: lng!,
        label: `${reaction.emoji} GymSound → ${first}${trackHint}`,
        intensity: reactionId === 'fire' ? 1.6 : 1.2,
      },
    ])
    setTimeout(
      () => options.setSyncRipples?.((r) => r.filter((x) => x.id !== rippleId)),
      2800
    )
  }
}
