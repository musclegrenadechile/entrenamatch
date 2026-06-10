import { useCallback, useEffect, useState } from 'react'
import { Music2, Unplug } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile } from '../../types'
import {
  disconnectSpotify,
  fetchSpotifyNowPlaying,
  getSpotifyRedirectUri,
  getValidSpotifyAccessToken,
  isSpotifyConfigured,
  isSpotifyConnected,
  spotifyHasRemoteControlScope,
  startSpotifyAuth,
  toProfileNowPlaying,
} from '../../services/spotify'
import { onSpotifyAuthResult } from '../../services/spotifyAuthEvents'
import { buildGymSoundAnthemFromUrl, isYoutubeUrl, normalizeYoutubeUrl } from '../../services/youtubeMusic'
import { anthemToDisplay } from '../../services/gymSound'
import { GymSoundControls } from './GymSoundControls'
import { NowPlayingBadge } from './NowPlayingBadge'
import { WorkoutPlaylistQuickPick } from './WorkoutPlaylistQuickPick'

type GymSoundSource = 'spotify' | 'youtube'

export interface GymSoundCardProps {
  currentUser: Profile
  saveUserWithRealSync: (user: Profile) => void | Promise<void>
  triggerHaptic?: (kind: 'light' | 'medium' | 'heavy') => void
}

export function GymSoundCard({
  currentUser,
  saveUserWithRealSync,
  triggerHaptic,
}: GymSoundCardProps) {
  const [source, setSource] = useState<GymSoundSource>(isSpotifyConnected() ? 'spotify' : 'youtube')
  const [connected, setConnected] = useState(isSpotifyConnected())
  const [connecting, setConnecting] = useState(false)
  const [preview, setPreview] = useState(currentUser.spotifyNowPlaying ?? null)
  const [ytUrl, setYtUrl] = useState(currentUser.gymSoundAnthem?.trackUrl || '')
  const [ytSaving, setYtSaving] = useState(false)

  const configured = isSpotifyConfigured()
  const shareLive = !!currentUser.spotifyShareLive
  const hasRemote = spotifyHasRemoteControlScope()
  const anthemPreview = currentUser.gymSoundAnthem ? anthemToDisplay(currentUser.gymSoundAnthem) : null

  const refreshPreview = useCallback(async () => {
    const token = await getValidSpotifyAccessToken()
    if (!token) {
      setConnected(false)
      setPreview(null)
      return
    }
    setConnected(true)
    const data = await fetchSpotifyNowPlaying(token)
    setPreview(data ? toProfileNowPlaying(data) : null)
  }, [])

  useEffect(() => {
    if (connected) void refreshPreview()
  }, [connected, refreshPreview])

  const handleConnect = async (reauth = false) => {
    if (!configured) {
      toast.error('Spotify no está configurado en esta build')
      return
    }
    setConnecting(true)
    triggerHaptic?.('light')
    try {
      if (reauth) disconnectSpotify()
      await startSpotifyAuth()
    } catch (err) {
      setConnecting(false)
      toast.error(err instanceof Error ? err.message : 'No se pudo abrir Spotify')
    }
  }

  const handleDisconnect = async () => {
    triggerHaptic?.('light')
    disconnectSpotify()
    setConnected(false)
    setPreview(null)
    try {
      await saveUserWithRealSync({
        ...currentUser,
        spotifyShareLive: false,
        spotifyNowPlaying: undefined,
      })
      toast.success('Spotify desconectado')
    } catch {
      toast.error('No se pudo actualizar el perfil')
    }
  }

  const toggleShareLive = async () => {
    const next = !shareLive
    triggerHaptic?.('light')
    try {
      await saveUserWithRealSync({
        ...currentUser,
        spotifyShareLive: next,
        spotifyNowPlaying: next ? currentUser.spotifyNowPlaying : undefined,
        gymSoundAnthem: next ? currentUser.gymSoundAnthem : undefined,
      })
      toast.success(next ? 'Compartirás tu música en LIVE' : 'Música oculta en LIVE', {
        description: next
          ? 'Otros verán qué escuchas en mapa, chat y perfil.'
          : 'Solo tú ves tu preview aquí.',
      })
      if (next) void refreshPreview()
    } catch {
      toast.error('No se pudo guardar la preferencia')
    }
  }

  const saveYoutubeAnthem = async () => {
    const normalized = normalizeYoutubeUrl(ytUrl)
    if (!normalized || !isYoutubeUrl(normalized)) {
      toast.error('Pega un link válido de YouTube o YouTube Music')
      return
    }
    setYtSaving(true)
    triggerHaptic?.('light')
    try {
      const anthem = await buildGymSoundAnthemFromUrl(normalized)
      if (!anthem) {
        toast.error('No se pudo leer el video. Prueba otro link.')
        return
      }
      await saveUserWithRealSync({
        ...currentUser,
        gymSoundAnthem: anthem,
      })
      toast.success('Tema guardado para LIVE', {
        description: anthem.trackName,
      })
    } catch {
      toast.error('No se pudo guardar el tema')
    } finally {
      setYtSaving(false)
    }
  }

  const clearYoutubeAnthem = async () => {
    triggerHaptic?.('light')
    setYtUrl('')
    try {
      await saveUserWithRealSync({
        ...currentUser,
        gymSoundAnthem: undefined,
      })
      toast.success('Tema manual eliminado')
    } catch {
      toast.error('No se pudo actualizar')
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1DB954]/15 flex items-center justify-center shrink-0">
          <Music2 size={20} className="text-[#1DB954]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">GymSound</div>
          <p className="text-xs text-[#9CA3AF] mt-0.5 leading-relaxed">
            Fase 2: control remoto Spotify + himno YouTube Music en LIVE.
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-1 p-1 rounded-xl bg-[#141418] border border-[#2F2F35]">
        <button
          type="button"
          onClick={() => setSource('spotify')}
          className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition ${
            source === 'spotify' ? 'bg-[#1DB954]/20 text-[#1DB954]' : 'text-[#9CA3AF]'
          }`}
        >
          Spotify
        </button>
        <button
          type="button"
          onClick={() => setSource('youtube')}
          className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition ${
            source === 'youtube' ? 'bg-[#FF0000]/20 text-[#ff6b6b]' : 'text-[#9CA3AF]'
          }`}
        >
          YouTube Music
        </button>
      </div>

      {source === 'spotify' && (
        <>
          {!configured && (
            <p className="text-[11px] text-[#fbbf24] mt-3 bg-[#fbbf24]/10 rounded-lg px-3 py-2">
              Falta <code className="text-[10px]">VITE_SPOTIFY_CLIENT_ID</code> en el build.{' '}
              <a
                href="https://developer.spotify.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-[#1DB954]"
              >
                Spotify Dashboard
              </a>
            </p>
          )}

          {configured && (
            <p className="text-[10px] text-[#6B7280] mt-2 font-mono break-all">
              Redirect URI: {getSpotifyRedirectUri()}
            </p>
          )}

          {connected && preview && (
            <div className="mt-3 space-y-2">
              <NowPlayingBadge nowPlaying={preview} size="md" provider="spotify" />
              {hasRemote && (
                <GymSoundControls isPlaying={preview.isPlaying} onPlaybackChange={refreshPreview} />
              )}
            </div>
          )}

          {connected && !preview && (
            <p className="text-[11px] text-[#8696a0] mt-3">Reproduce algo en Spotify para ver el preview.</p>
          )}

          {connected && !hasRemote && (
            <p className="text-[11px] text-[#fbbf24] mt-3 bg-[#fbbf24]/10 rounded-lg px-3 py-2">
              Para control remoto (play/pausa/skip), vuelve a conectar Spotify con los permisos nuevos.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {!connected ? (
              <button
                type="button"
                disabled={!configured || connecting}
                onClick={() => void handleConnect()}
                className="px-4 py-2 rounded-full bg-[#1DB954] text-black text-xs font-bold active:brightness-90 disabled:opacity-50"
              >
                {connecting ? 'Abriendo Spotify…' : 'Conectar Spotify'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  role="switch"
                  aria-checked={shareLive}
                  onClick={() => void toggleShareLive()}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition ${
                    shareLive
                      ? 'bg-[#FF671F]/20 border-[#FF671F]/50 text-[#FF671F]'
                      : 'bg-[#25252A] border-[#2F2F35] text-[#9CA3AF]'
                  }`}
                >
                  {shareLive ? '🎧 Compartir en LIVE' : 'Compartir en LIVE'}
                </button>
                <button
                  type="button"
                  onClick={() => void refreshPreview()}
                  className="px-3 py-2 rounded-full bg-[#25252A] border border-[#2F2F35] text-xs text-white"
                >
                  Actualizar
                </button>
                {!hasRemote && (
                  <button
                    type="button"
                    disabled={connecting}
                    onClick={() => void handleConnect(true)}
                    className="px-3 py-2 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/40 text-[#1DB954] text-xs font-bold"
                  >
                    Habilitar control remoto
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void handleDisconnect()}
                  className="px-3 py-2 rounded-full border border-[#3f2a2a] text-[#f87171] text-xs flex items-center gap-1"
                >
                  <Unplug size={12} />
                  Desconectar
                </button>
              </>
            )}
          </div>

          {connected && <WorkoutPlaylistQuickPick className="mt-3" />}
        </>
      )}

      {source === 'youtube' && (
        <>
          <p className="text-[11px] text-[#9CA3AF] mt-3 leading-relaxed">
            Sin API oficial: pega un link de YouTube Music o YouTube. Se muestra en LIVE si activas compartir.
          </p>

          {anthemPreview && (
            <div className="mt-3">
              <NowPlayingBadge nowPlaying={anthemPreview} size="md" provider={anthemPreview.provider} />
            </div>
          )}

          <input
            type="url"
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
            placeholder="https://music.youtube.com/watch?v=…"
            className="mt-3 w-full px-3 py-2.5 rounded-xl bg-[#141418] border border-[#2F2F35] text-xs text-white placeholder:text-[#6B7280]"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={shareLive}
              onClick={() => void toggleShareLive()}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition ${
                shareLive
                  ? 'bg-[#FF671F]/20 border-[#FF671F]/50 text-[#FF671F]'
                  : 'bg-[#25252A] border-[#2F2F35] text-[#9CA3AF]'
              }`}
            >
              {shareLive ? '🎧 Compartir en LIVE' : 'Compartir en LIVE'}
            </button>
            <button
              type="button"
              disabled={ytSaving || !ytUrl.trim()}
              onClick={() => void saveYoutubeAnthem()}
              className="px-4 py-2 rounded-full bg-[#FF0000]/90 text-white text-xs font-bold disabled:opacity-50"
            >
              {ytSaving ? 'Guardando…' : 'Guardar tema'}
            </button>
            {currentUser.gymSoundAnthem && (
              <button
                type="button"
                onClick={() => void clearYoutubeAnthem()}
                className="px-3 py-2 rounded-full border border-[#3f2a2a] text-[#f87171] text-xs"
              >
                Quitar
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
