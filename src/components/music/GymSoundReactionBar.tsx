import {
  GYM_SOUND_REACTIONS,
  sendGymSoundReaction,
  type GymSoundReactionId,
  type MusicReactionTarget,
  type SyncRipple,
} from '../../services/gymSoundReactions'
import type { GymSoundDisplay } from '../../types'

export interface GymSoundReactionBarProps {
  target: MusicReactionTarget
  selfName?: string
  selfNowPlaying?: GymSoundDisplay | null
  setSyncRipples?: (updater: SyncRipple[] | ((prev: SyncRipple[]) => SyncRipple[])) => void
  onHaptic?: () => void
  compact?: boolean
  className?: string
}

export function GymSoundReactionBar({
  target,
  selfName,
  selfNowPlaying,
  setSyncRipples,
  onHaptic,
  compact,
  className = '',
}: GymSoundReactionBarProps) {
  if (!target.nowPlaying?.trackName) return null

  const react = (id: GymSoundReactionId) => {
    sendGymSoundReaction(id, target, {
      selfName,
      selfNowPlaying,
      setSyncRipples,
      onHaptic,
    })
  }

  return (
    <div
      className={`gym-sound-reaction-bar ${compact ? 'gym-sound-reaction-bar--compact' : ''} ${className}`.trim()}
      role="toolbar"
      aria-label="Reaccionar a la música"
    >
      {GYM_SOUND_REACTIONS.map((r) => (
        <button
          key={r.id}
          type="button"
          className="gym-sound-reaction-bar__btn"
          title={r.label}
          onClick={(e) => {
            e.stopPropagation()
            react(r.id)
          }}
        >
          <span aria-hidden>{r.emoji}</span>
          {!compact && <span className="gym-sound-reaction-bar__lbl">{r.label}</span>}
        </button>
      ))}
    </div>
  )
}
