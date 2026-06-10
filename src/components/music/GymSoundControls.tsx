import { useCallback, useEffect, useState } from 'react'
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { toast } from 'sonner'
import {
  fetchSpotifyPlaybackState,
  getValidSpotifyAccessToken,
  spotifyHasRemoteControlScope,
  spotifySkipNext,
  spotifySkipPrevious,
  spotifyTogglePlayback,
  type SpotifyRemoteResult,
} from '../../services/spotify'

export interface GymSoundControlsProps {
  isPlaying?: boolean
  compact?: boolean
  onPlaybackChange?: () => void
  className?: string
}

function remoteErrorMessage(result: SpotifyRemoteResult): string {
  if (result.ok) return ''
  if (result.reason === 'no_device') {
    return 'Abre Spotify en tu teléfono y reproduce algo primero.'
  }
  if (result.reason === 'premium_required') {
    return 'Control remoto requiere Spotify Premium.'
  }
  if (result.reason === 'unauthorized') {
    return 'Sesión de Spotify expirada. Vuelve a conectar.'
  }
  return 'No se pudo controlar Spotify. Intenta de nuevo.'
}

export function GymSoundControls({
  isPlaying: isPlayingProp,
  compact = false,
  onPlaybackChange,
  className = '',
}: GymSoundControlsProps) {
  const [busy, setBusy] = useState(false)
  const [isPlaying, setIsPlaying] = useState(!!isPlayingProp)
  const [deviceName, setDeviceName] = useState<string | null>(null)
  const hasRemote = spotifyHasRemoteControlScope()

  const refreshState = useCallback(async () => {
    const token = await getValidSpotifyAccessToken()
    if (!token) return
    const state = await fetchSpotifyPlaybackState(token)
    if (!state) return
    setIsPlaying(state.isPlaying)
    setDeviceName(state.deviceName || null)
  }, [])

  useEffect(() => {
    if (typeof isPlayingProp === 'boolean') setIsPlaying(isPlayingProp)
  }, [isPlayingProp])

  useEffect(() => {
    if (!hasRemote) return
    void refreshState()
  }, [hasRemote, refreshState])

  const runRemote = async (action: () => Promise<SpotifyRemoteResult>) => {
    if (!hasRemote || busy) return
    setBusy(true)
    try {
      const result = await action()
      if (!result.ok) {
        toast.error(remoteErrorMessage(result))
        return
      }
      await refreshState()
      onPlaybackChange?.()
    } finally {
      setBusy(false)
    }
  }

  const handleToggle = () =>
    void runRemote(async () => {
      const token = await getValidSpotifyAccessToken()
      if (!token) return { ok: false, reason: 'unauthorized' as const }
      return spotifyTogglePlayback(token, isPlaying)
    })

  const handleNext = () =>
    void runRemote(async () => {
      const token = await getValidSpotifyAccessToken()
      if (!token) return { ok: false, reason: 'unauthorized' as const }
      return spotifySkipNext(token)
    })

  const handlePrev = () =>
    void runRemote(async () => {
      const token = await getValidSpotifyAccessToken()
      if (!token) return { ok: false, reason: 'unauthorized' as const }
      return spotifySkipPrevious(token)
    })

  if (!hasRemote) return null

  const btnClass = compact
    ? 'gym-sound-ctrl-btn gym-sound-ctrl-btn--sm'
    : 'gym-sound-ctrl-btn'

  return (
    <div className={`gym-sound-controls ${compact ? 'gym-sound-controls--compact' : ''} ${className}`.trim()}>
      <button type="button" className={btnClass} disabled={busy} onClick={handlePrev} aria-label="Anterior">
        <SkipBack size={compact ? 16 : 18} />
      </button>
      <button
        type="button"
        className={`${btnClass} gym-sound-ctrl-btn--primary`}
        disabled={busy}
        onClick={handleToggle}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        {isPlaying ? <Pause size={compact ? 18 : 20} /> : <Play size={compact ? 18 : 20} />}
      </button>
      <button type="button" className={btnClass} disabled={busy} onClick={handleNext} aria-label="Siguiente">
        <SkipForward size={compact ? 16 : 18} />
      </button>
      {deviceName && !compact && (
        <span className="gym-sound-controls__device truncate">En {deviceName}</span>
      )}
    </div>
  )
}
