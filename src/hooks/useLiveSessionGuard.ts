import { useEffect, useRef } from 'react'
import {
  getLiveSessionExpiryReason,
  isLiveSessionActive,
  LIVE_APP_HIDDEN_AUTO_OFF_MS,
  LIVE_SESSION_TICK_MS,
  liveSessionExpiryLabel,
} from '../utils/liveSessionPolicy'

export type UseLiveSessionGuardArgs = {
  enabled: boolean
  trainingNow: boolean
  trainingNowSince?: number | null
  liveMotionAt?: number
  appVisible: boolean
  onAutoOff: (reason: string) => void | Promise<void>
}

/**
 * Auto-apaga LIVE del usuario actual cuando la sesión caduca (3 h, sin heartbeat, app oculta).
 */
export function useLiveSessionGuard({
  enabled,
  trainingNow,
  trainingNowSince,
  liveMotionAt,
  appVisible,
  onAutoOff,
}: UseLiveSessionGuardArgs) {
  const hiddenSinceRef = useRef<number | null>(null)
  const autoOffFiredRef = useRef(false)
  const onAutoOffRef = useRef(onAutoOff)
  onAutoOffRef.current = onAutoOff

  useEffect(() => {
    if (!trainingNow) {
      hiddenSinceRef.current = null
      autoOffFiredRef.current = false
    }
  }, [trainingNow])

  useEffect(() => {
    if (!enabled || !trainingNow) return undefined

    const tick = () => {
      const now = Date.now()

      if (!appVisible) {
        if (hiddenSinceRef.current == null) hiddenSinceRef.current = now
        if (
          now - hiddenSinceRef.current >= LIVE_APP_HIDDEN_AUTO_OFF_MS &&
          !autoOffFiredRef.current
        ) {
          autoOffFiredRef.current = true
          void onAutoOffRef.current('Sesión LIVE finalizada — app en segundo plano >30 min')
        }
        return
      }
      hiddenSinceRef.current = null

      const subject = {
        trainingNow: true,
        trainingNowSince,
        liveMotionAt,
      }
      if (isLiveSessionActive(subject, now)) return

      const reason = getLiveSessionExpiryReason(subject, now)
      if (!reason || autoOffFiredRef.current) return
      autoOffFiredRef.current = true
      void onAutoOffRef.current(liveSessionExpiryLabel(reason))
    }

    tick()
    const id = window.setInterval(tick, LIVE_SESSION_TICK_MS)
    return () => window.clearInterval(id)
  }, [enabled, trainingNow, trainingNowSince, liveMotionAt, appVisible])
}
