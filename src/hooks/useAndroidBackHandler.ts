import { useEffect } from 'react'

export type BackHandlerLayer = {
  id: string
  isOpen: boolean
  onClose: () => void
}

/**
 * Android hardware back: close topmost overlay before exiting app (fase 177).
 * Layers are evaluated last-first (most recently registered wins among open layers).
 */
export function useAndroidBackHandler(layers: BackHandlerLayer[]) {
  useEffect(() => {
    let removeListener: (() => void) | undefined

    ;(async () => {
      try {
        const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
        if (!cap?.isNativePlatform?.()) return

        const AppPlugin = await import(/* @vite-ignore */ '@capacitor/app').catch(() => null)
        if (!AppPlugin?.App?.addListener) return

        const handle = await AppPlugin.App.addListener('backButton', () => {
          const open = [...layers].reverse().find((l) => l.isOpen)
          if (open) {
            open.onClose()
            return
          }
          AppPlugin.App.exitApp?.()
        })
        removeListener = () => {
          try {
            handle.remove()
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* App plugin optional on web */
      }
    })()

    return () => {
      removeListener?.()
    }
  }, [layers])
}
