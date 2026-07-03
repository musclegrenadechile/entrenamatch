import { useCallback, useEffect, useState } from 'react'
import { Music2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile } from '../../types'
import {
  fetchSpotifyNowPlaying,
  getValidSpotifyAccessToken,
  isSpotifyConfigured,
  isSpotifyConnected,
  spotifyHasRemoteControlScope,
  startSpotifyAuth,
  toProfileNowPlaying,
} from '../../services/spotify'
import { getPublicGymSound } from '../../services/gymSound'
import { GymSoundControls } from './GymSoundControls'
import { NowPlayingBadge } from './NowPlayingBadge'
import { WorkoutPlaylistQuickPick } from './WorkoutPlaylistQuickPick'

export interface GymSoundWorkoutBarProps {
  currentUser: Profile
  isLive: boolean
  saveUser: (user: Profile) => void | Promise<void>
}

/** Compact GymSound controls inside Modo gym / Entreno de Hoy. */
export function GymSoundWorkoutBar({ currentUser, isLive, saveUser }: GymSoundWorkoutBarProps) {
  const [connecting, setConnecting] = useState(false)
  const [preview, setPreview] = useState(() => getPublicGymSound(currentUser) ?? null)

  const configured = isSpotifyConfigured()
  const connected = isSpotifyConnected()
  const hasRemote = spotifyHasRemoteControlScope()
  const shareLive = !!currentUser.spotifyShareLive

  const refreshPreview = useCallback(async () => {
    const token = await getValidSpotifyAccessToken()
    if (!token) {
      setPreview(null)
      return
    }
    const data = await fetchSpotifyNowPlaying(token)
    const np = data ? toProfileNowPlaying(data) : null
    setPreview(np ? { ...np, provider: 'spotify' as const } : null)
  }, [])

  useEffect(() => {
    setPreview(getPublicGymSound(currentUser) ?? null)
  }, [currentUser.spotifyNowPlaying, currentUser.gymSoundAnthem, currentUser.spotifyShareLive, isLive])

  useEffect(() => {
    if (connected) void refreshPreview()
  }, [connected, refreshPreview])

  const toggleShare = async () => {
    const next = !shareLive
    try {
      await saveUser({
        ...currentUser,
        spotifyShareLive: next,
        spotifyNowPlaying: next ? currentUser.spotifyNowPlaying : undefined,
        gymSoundAnthem: next ? currentUser.gymSoundAnthem : undefined,
      })
      toast.success(next ? 'Música visible en LIVE y mapa' : 'Música solo para ti', { duration: 4000 })
    } catch {
      toast.error('No se pudo guardar')
    }
  }

  const handleConnect = async () => {
    if (!configured) {
      toast.error('Spotify no configurado en esta build')
      return
    }
    setConnecting(true)
    try {
      await startSpotifyAuth()
      toast.info('Completa el login en Spotify', { duration: 4000 })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo abrir Spotify')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <section className="em-v2-gym-sound-workout" aria-label="GymSound en tu entreno">
      <div className="em-v2-gym-sound-workout__head">
        <Music2 size={16} className="em-v2-gym-sound-workout__icon shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="em-v2-gym-sound-workout__title">GymSound</p>
          <p className="em-v2-gym-sound-workout__hint">
            {isLive && shareLive
              ? 'Tu música se ve en el mapa en vivo'
              : 'Conecta y comparte mientras entrenas en LIVE'}
          </p>
        </div>
        {!connected ? (
          <button
            type="button"
            disabled={connecting || !configured}
            onClick={() => void handleConnect()}
            className="em-v2-gym-sound-workout__btn em-v2-gym-sound-workout__btn--spotify"
          >
            {connecting ? '…' : 'Spotify'}
          </button>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={shareLive}
            onClick={() => void toggleShare()}
            className={`em-v2-gym-sound-workout__btn ${shareLive ? 'em-v2-gym-sound-workout__btn--on' : ''}`}
          >
            {shareLive ? 'ON' : 'OFF'}
          </button>
        )}
      </div>
      {connected && preview && (
        <div className="em-v2-gym-sound-workout__now">
          <NowPlayingBadge nowPlaying={preview} size="sm" className="em-v2-gym-sound-workout__badge" />
          {hasRemote && (
            <GymSoundControls
              compact
              isPlaying={preview.isPlaying}
              onPlaybackChange={refreshPreview}
              className="em-v2-gym-sound-workout__controls"
            />
          )}
        </div>
      )}
      {connected && !preview && (
        <p className="em-v2-gym-sound-workout__empty">
          Reproduce algo en Spotify para controlar desde aquí.
        </p>
      )}
      {connected && !hasRemote && (
        <p className="em-v2-gym-sound-workout__warn">
          Para play/pausa/skip, reconecta Spotify desde Perfil con permisos de control remoto.
        </p>
      )}
      {connected && <WorkoutPlaylistQuickPick compact className="em-v2-gym-sound-workout__playlists" />}
    </section>
  )
}