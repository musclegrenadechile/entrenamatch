import type { GymSoundSyncMatch } from '../../services/gymSoundSyncMatch'
import { NowPlayingBadge } from './NowPlayingBadge'

export interface GymSoundSyncChipProps {
  match: GymSoundSyncMatch
  partnerFirst?: string
}

/** Music compatibility banner inside EntrenaSync arena. */
export function GymSoundSyncChip({ match, partnerFirst = 'Compañero' }: GymSoundSyncChipProps) {
  const showTrack = match.sameTrack && match.selfMusic

  return (
    <section className="gym-sound-sync-chip em-v2-arena-sound" aria-label="Sync musical">
      <div className="gym-sound-sync-chip__head em-v2-arena-sound__head">
        <span className="gym-sound-sync-chip__emoji em-v2-arena-sound__emoji" aria-hidden>
          {match.emoji}
        </span>
        <span className="gym-sound-sync-chip__label em-v2-arena-sound__label">{match.label}</span>
      </div>
      {showTrack && (
        <NowPlayingBadge nowPlaying={match.selfMusic!} size="sm" className="gym-sound-sync-chip__track em-v2-arena-sound__track" />
      )}
      {match.bothSharing && !match.sameTrack && match.partnerMusic && (
        <p className="gym-sound-sync-chip__partner em-v2-arena-sound__partner">
          {partnerFirst}: {match.partnerMusic.trackName}
          {match.partnerMusic.artistName ? ` · ${match.partnerMusic.artistName}` : ''}
        </p>
      )}
    </section>
  )
}
