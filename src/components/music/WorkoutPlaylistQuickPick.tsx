import { useState } from 'react'
import { toast } from 'sonner'
import { WORKOUT_PLAYLISTS, openWorkoutPlaylist } from '../../services/workoutPlaylists'

export interface WorkoutPlaylistQuickPickProps {
  compact?: boolean
  className?: string
}

/** 1-tap Spotify workout playlists — no embedded player. */
export function WorkoutPlaylistQuickPick({ compact, className = '' }: WorkoutPlaylistQuickPickProps) {
  const [opening, setOpening] = useState<string | null>(null)

  const handleOpen = async (id: string) => {
    const pl = WORKOUT_PLAYLISTS.find((p) => p.id === id)
    if (!pl) return
    setOpening(id)
    try {
      await openWorkoutPlaylist(pl)
      toast.success(`${pl.emoji} ${pl.label} en Spotify`, { duration: 2500 })
    } catch {
      toast.error('No se pudo abrir Spotify')
    } finally {
      setOpening(null)
    }
  }

  return (
    <div
      className={`em-v2-workout-playlists ${compact ? 'em-v2-workout-playlists--compact' : ''} ${className}`.trim()}
    >
      <p className="em-v2-workout-playlists__label">Playlists entreno</p>
      <div className="em-v2-workout-playlists__row" role="list">
        {WORKOUT_PLAYLISTS.map((pl) => (
          <button
            key={pl.id}
            type="button"
            role="listitem"
            disabled={opening === pl.id}
            className="em-v2-workout-playlists__chip"
            onClick={() => void handleOpen(pl.id)}
            title={`Abrir ${pl.label} en Spotify`}
          >
            <span aria-hidden>{pl.emoji}</span>
            <span>{opening === pl.id ? '…' : pl.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}