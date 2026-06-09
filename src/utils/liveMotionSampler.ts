/**
 * Device motion sampling — fase B.
 * Uses DeviceMotionEvent (Capacitor WebView + modern mobile browsers).
 */

import type { AccelSample } from './liveMotionScore'
import {
  LIVE_MOTION_WINDOW_INTERVAL_MS,
  LIVE_MOTION_WINDOW_MS,
} from './liveMotionScore'

type DeviceMotionEventWithPermission = DeviceMotionEvent & {
  requestPermission?: () => Promise<'granted' | 'denied' | 'default'>
}

export function isMotionApiAvailable(): boolean {
  return typeof window !== 'undefined' && 'DeviceMotionEvent' in window
}

/** iOS 13+ requires explicit permission before devicemotion events fire. */
export async function requestMotionPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  const DME = DeviceMotionEvent as unknown as DeviceMotionEventWithPermission
  if (typeof DME.requestPermission !== 'function') return true
  try {
    const result = await DME.requestPermission()
    return result === 'granted'
  } catch {
    return false
  }
}

/** Collect accelerometer samples for a short window. */
export function sampleMotionWindow(
  durationMs = LIVE_MOTION_WINDOW_MS,
  intervalMs = LIVE_MOTION_WINDOW_INTERVAL_MS
): Promise<AccelSample[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !isMotionApiAvailable()) {
      resolve([])
      return
    }

    const samples: AccelSample[] = []
    const started = Date.now()
    let lastPush = 0

    const onMotion = (ev: DeviceMotionEvent) => {
      const acc = ev.accelerationIncludingGravity
      if (!acc || acc.x == null || acc.y == null || acc.z == null) return
      const now = Date.now()
      if (now - lastPush < intervalMs) return
      lastPush = now
      samples.push({ x: acc.x, y: acc.y, z: acc.z, t: now })
    }

    const finish = () => {
      window.removeEventListener('devicemotion', onMotion)
      resolve(samples)
    }

    window.addEventListener('devicemotion', onMotion)
    window.setTimeout(finish, durationMs + 50)

    if (Date.now() - started > durationMs + 500) finish()
  })
}
