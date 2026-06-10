import { useEffect, useRef } from 'react'
import { ensureCapacitorPlugins, getCapacitorApp } from '../utils/capacitorRuntimePlugins'

export type BackHandlerLayer = {
  id: string
  isOpen: boolean
  onClose: () => void
}

function isNativeApp(): boolean {
  try {
    const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
    return !!cap?.isNativePlatform?.()
  } catch {
    return false
  }
}

/**
 * Android hardware back: close topmost overlay before exiting app (fase 177).
 * Layers are evaluated last-first (most recently registered wins among open layers).
 */
export function useAndroidBackHandler(layers: BackHandlerLayer[]) {
  const layersRef = useRef(layers)
  layersRef.current = layers

  useEffect(() => {
    if (typeof window === 'undefined' || !isNativeApp()) return
    const platform = (window as Window & { Capacitor?: { getPlatform?: () => string } }).Capacitor?.getPlatform?.()
    if (platform && platform !== 'android') return

    let removeListener: (() => void) | undefined
    let cancelled = false

    ;(async () => {
      await ensureCapacitorPlugins()
      const App = getCapacitorApp()
      if (!App || cancelled) return

      const handle = await App.addListener('backButton', () => {
        const open = [...layersRef.current].reverse().find((l) => l.isOpen)
        if (open) {
          open.onClose()
          return
        }
        void App.exitApp?.()
      })
      removeListener = () => {
        try {
          handle.remove()
        } catch {
          /* ignore */
        }
      }
    })()

    return () => {
      cancelled = true
      removeListener?.()
    }
  }, [])
}
