/**
 * Samples device motion while user is LIVE — fase B.
 * Writes motion score every ~3 min; map uses idle state to attenuate pins.
 */

import { useEffect, useRef } from 'react'
import {
  computeGpsDriftScore,
  computeMotionVarianceScore,
  LIVE_MOTION_SAMPLE_INTERVAL_MS,
  mergeMotionSample,
  type LiveActivityState,
} from '../utils/liveMotionScore'
import { isMotionApiAvailable, requestMotionPermission, sampleMotionWindow } from '../utils/liveMotionSampler'

export interface LiveMotionSampleResult {
  score: number
  lastAt: number
  idle: boolean
  state: LiveActivityState
  source: 'accel' | 'gps' | 'none'
}

export interface UseLiveMotionMonitorOptions {
  enabled: boolean
  prevScore?: number
  getLocation?: () => { lat: number; lng: number } | null
  onSample: (result: LiveMotionSampleResult) => void
  /** First sample delay after going live (default 45s). */
  initialDelayMs?: number
}

export function useLiveMotionMonitor(opts: UseLiveMotionMonitorOptions): void {
  const { enabled, prevScore, getLocation, onSample, initialDelayMs = 45_000 } = opts
  const onSampleRef = useRef(onSample)
  const prevScoreRef = useRef(prevScore)
  const permissionAskedRef = useRef(false)
  const gpsTrailRef = useRef<Array<{ lat: number; lng: number; t: number }>>([])

  onSampleRef.current = onSample
  prevScoreRef.current = prevScore

  useEffect(() => {
    if (!enabled) {
      gpsTrailRef.current = []
      return
    }

    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | null = null

    const runSample = async () => {
      if (cancelled) return

      const loc = getLocation?.()
      if (loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) {
        gpsTrailRef.current.push({ lat: loc.lat, lng: loc.lng, t: Date.now() })
        const cutoff = Date.now() - LIVE_MOTION_SAMPLE_INTERVAL_MS * 2
        gpsTrailRef.current = gpsTrailRef.current.filter((p) => p.t >= cutoff)
      }

      let score = 0
      let source: LiveMotionSampleResult['source'] = 'none'

      if (isMotionApiAvailable()) {
        if (!permissionAskedRef.current) {
          permissionAskedRef.current = true
          await requestMotionPermission()
        }
        const samples = await sampleMotionWindow()
        if (samples.length >= 3) {
          score = computeMotionVarianceScore(samples)
          source = 'accel'
        }
      }

      if (source === 'none' && gpsTrailRef.current.length >= 2) {
        score = computeGpsDriftScore(gpsTrailRef.current)
        if (score > 0) source = 'gps'
      }

      if (source === 'none') return

      const merged = mergeMotionSample(prevScoreRef.current, score)
      onSampleRef.current({
        score: merged.score,
        lastAt: merged.lastAt,
        idle: merged.idle,
        state: merged.state,
        source,
      })
    }

    const initialTimer = window.setTimeout(() => {
      void runSample()
      intervalId = setInterval(() => void runSample(), LIVE_MOTION_SAMPLE_INTERVAL_MS)
    }, initialDelayMs)

    return () => {
      cancelled = true
      clearTimeout(initialTimer)
      if (intervalId) clearInterval(intervalId)
    }
  }, [enabled, getLocation, initialDelayMs])
}
