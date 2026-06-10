import { useCallback } from 'react'
import type { GymSoundDisplay } from '../../types'
import { GymSoundControls } from './GymSoundControls'
import { NowPlayingBadge } from './NowPlayingBadge'
import { WorkoutPlaylistQuickPick } from './WorkoutPlaylistQuickPick'
import { isSpotifyConnected, spotifyHasRemoteControlScope } from '../../services/spotify'

export interface GymSoundLiveStripProps {
  nowPlaying?: GymSoundDisplay | null
  onRefresh?: () => void
}

export function GymSoundLiveStrip({ nowPlaying, onRefresh }: GymSoundLiveStripProps) {
  const connected = isSpotifyConnected()
  const showControls = connected && spotifyHasRemoteControlScope()

  const handlePlaybackChange = useCallback(() => {
    onRefresh?.()
  }, [onRefresh])

  if (!nowPlaying && !showControls) return null

  return (
    <section className="gym-sound-live-strip" aria-label="GymSound en vivo">
      <div className="gym-sound-live-strip__row">
        <span className="gym-sound-live-strip__label">GymSound</span>
        {showControls && (
          <GymSoundControls
            compact
            isPlaying={nowPlaying?.isPlaying}
            onPlaybackChange={handlePlaybackChange}
          />
        )}
      </div>
      {nowPlaying && (
        <NowPlayingBadge nowPlaying={nowPlaying} size="md" provider={nowPlaying.provider} />
      )}
      {connected && <WorkoutPlaylistQuickPick compact />}
    </section>
  )
}
