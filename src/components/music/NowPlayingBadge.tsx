import { Music2 } from 'lucide-react'
import type { GymSoundDisplay, GymSoundProvider } from '../../types'

export interface NowPlayingBadgeProps {
  nowPlaying: GymSoundDisplay
  size?: 'sm' | 'md'
  provider?: GymSoundProvider
  className?: string
}

export function NowPlayingBadge({
  nowPlaying,
  size = 'sm',
  provider: providerProp,
  className = '',
}: NowPlayingBadgeProps) {
  const compact = size === 'sm'
  const provider = providerProp || nowPlaying.provider || 'spotify'

  const content = (
    <>
      {nowPlaying.albumArtUrl ? (
        <img
          src={nowPlaying.albumArtUrl}
          alt=""
          className={`gym-sound-badge__art ${compact ? 'gym-sound-badge__art--sm' : ''}`}
          loading="lazy"
        />
      ) : (
        <span className="gym-sound-badge__icon" aria-hidden>
          <Music2 size={compact ? 12 : 14} />
        </span>
      )}
      <span className="gym-sound-badge__text min-w-0">
        <span className="gym-sound-badge__track truncate">{nowPlaying.trackName}</span>
        <span className="gym-sound-badge__artist truncate">{nowPlaying.artistName}</span>
      </span>
      {nowPlaying.isPlaying && <span className="gym-sound-badge__eq" aria-hidden />}
    </>
  )

  const cls = `gym-sound-badge gym-sound-badge--${size} gym-sound-badge--${provider} ${className}`.trim()

  if (nowPlaying.trackUrl) {
    return (
      <a
        href={nowPlaying.trackUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        title={`${nowPlaying.trackName} — ${nowPlaying.artistName}`}
      >
        {content}
      </a>
    )
  }

  return (
    <div className={cls} title={`${nowPlaying.trackName} — ${nowPlaying.artistName}`}>
      {content}
    </div>
  )
}
