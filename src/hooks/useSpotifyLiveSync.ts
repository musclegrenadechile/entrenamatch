/**
 * GymSound — OAuth callback + poll now playing while LIVE (opt-in).
 */

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type { SpotifyNowPlaying } from '../types'
import {
  clearSpotifyCallbackFromUrl,
  completeSpotifyAuth,
  fetchSpotifyNowPlaying,
  getValidSpotifyAccessToken,
  handleSpotifyDeepLink,
  isCapacitorNative,
  isSpotifyConnected,
  parseSpotifyCallbackFromUrl,
  toProfileNowPlaying,
} from '../services/spotify'
import { ensureCapacitorPlugins, getCapacitorApp } from '../utils/capacitorRuntimePlugins'
import { notifySpotifyAuthResult } from '../services/spotifyAuthEvents'

const POLL_MS = 15_000

export interface UseSpotifyLiveSyncOptions {
  enabled: boolean
  isLive: boolean
  shareWhileLive: boolean
  onNowPlayingChange: (nowPlaying: SpotifyNowPlaying | null) => void | Promise<void>
}

export function useSpotifyLiveSync(opts: UseSpotifyLiveSyncOptions): void {
  const { enabled, isLive, shareWhileLive, onNowPlayingChange } = opts
  const onChangeRef = useRef(onNowPlayingChange)
  const lastKeyRef = useRef<string | null>(null)
  const wasLiveRef = useRef(false)

  onChangeRef.current = onNowPlayingChange

  const finishSpotifyConnect = async (ok: boolean, silent = false) => {
    notifySpotifyAuthResult(ok, ok ? undefined : 'auth_failed')
    if (silent) return
    if (ok) {
      toast.success('Spotify conectado', {
        description: 'Activa "Compartir en LIVE" para que otros vean qué escuchas.',
      })
    } else {
      toast.error('No se pudo conectar Spotify')
    }
  }

  const processNativeSpotifyUrl = async (url: string) => {
    if (!url.includes('spotify-auth')) return
    try {
      const ok = await handleSpotifyDeepLink(url)
      await finishSpotifyConnect(ok)
    } catch {
      notifySpotifyAuthResult(false, 'error')
      toast.error('Error al conectar Spotify')
    }
  }

  // APK: deep link after Browser OAuth (com.entrenamatch.app://spotify-auth).
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !isCapacitorNative()) return

    const listeners: Array<{ remove: () => void }> = []
    let cancelled = false

    ;(async () => {
      await ensureCapacitorPlugins()
      const App = getCapacitorApp()
      if (!App || cancelled) return

      const launch = await App.getLaunchUrl?.().catch(() => undefined)
      if (launch?.url && !cancelled) {
        await processNativeSpotifyUrl(launch.url)
      }

      listeners.push(
        await App.addListener('appUrlOpen', (event) => {
          if (event.url) void processNativeSpotifyUrl(event.url)
        })
      )

      listeners.push(
        await App.addListener('appStateChange', (state) => {
          if (!state.isActive || cancelled) return
          if (isSpotifyConnected()) {
            void finishSpotifyConnect(true, true)
          }
        })
      )
    })()

    return () => {
      cancelled = true
      listeners.forEach((l) => l.remove())
    }
  }, [enabled])

  // Web: OAuth redirect callback on same origin.
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || isCapacitorNative()) return

    const url = new URL(window.location.href)
    const callback = parseSpotifyCallbackFromUrl(url)
    if (!callback) return

    let cancelled = false
    ;(async () => {
      try {
        const ok = await completeSpotifyAuth(callback.code, callback.state)
        if (cancelled) return
        clearSpotifyCallbackFromUrl()
        await finishSpotifyConnect(ok)
      } catch {
        if (!cancelled) toast.error('Error al conectar Spotify')
        clearSpotifyCallbackFromUrl()
      }
    })()

    return () => {
      cancelled = true
    }
  }, [enabled])

  // Poll Spotify while live + connected + opt-in.
  useEffect(() => {
    if (!enabled) return

    const shouldPoll = isLive && shareWhileLive && isSpotifyConnected()
    const shouldClear = !isLive && wasLiveRef.current

    wasLiveRef.current = isLive

    if (shouldClear) {
      lastKeyRef.current = null
      void onChangeRef.current(null)
    }

    if (!shouldPoll) {
      if (!isLive || !shareWhileLive) {
        lastKeyRef.current = null
        if (!isLive) void onChangeRef.current(null)
      }
      return
    }

    let cancelled = false

    const tick = async () => {
      const token = await getValidSpotifyAccessToken()
      if (!token || cancelled) return

      const data = await fetchSpotifyNowPlaying(token)
      if (cancelled) return

      if (!data) {
        const key = '__idle__'
        if (lastKeyRef.current !== key) {
          lastKeyRef.current = key
          await onChangeRef.current(null)
        }
        return
      }

      const profileNp = toProfileNowPlaying(data)
      const key = `${profileNp.trackName}|${profileNp.artistName}|${profileNp.isPlaying}`
      if (lastKeyRef.current === key) return
      lastKeyRef.current = key
      await onChangeRef.current(profileNp)
    }

    void tick()
    const id = setInterval(() => void tick(), POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [enabled, isLive, shareWhileLive])
}
