import { describe, expect, it } from 'vitest'
import {
  computeGpsDriftScore,
  computeMotionVarianceScore,
  deriveLiveActivityState,
  deriveLiveMotionIdle,
  LIVE_MOTION_IDLE_SCORE_THRESHOLD,
  LIVE_MOTION_IDLE_STALE_MS,
  mergeMotionSample,
} from './liveMotionScore'

describe('computeMotionVarianceScore', () => {
  it('returns 0 for too few samples', () => {
    expect(computeMotionVarianceScore([])).toBe(0)
    expect(computeMotionVarianceScore([{ x: 0, y: 0, z: 9.8, t: 0 }])).toBe(0)
  })

  it('scores higher for varied acceleration', () => {
    const rest = Array.from({ length: 20 }, (_, i) => ({
      x: 0.01,
      y: 0.02,
      z: 9.81,
      t: i,
    }))
    const active = Array.from({ length: 20 }, (_, i) => ({
      x: Math.sin(i) * 2,
      y: Math.cos(i) * 1.5,
      z: 9.8 + Math.sin(i * 0.5),
      t: i,
    }))
    expect(computeMotionVarianceScore(active)).toBeGreaterThan(computeMotionVarianceScore(rest))
    expect(computeMotionVarianceScore(active)).toBeGreaterThan(LIVE_MOTION_IDLE_SCORE_THRESHOLD)
  })
})

describe('deriveLiveMotionIdle', () => {
  const now = 1_000_000

  it('unknown when no timestamp (web without sensors)', () => {
    expect(deriveLiveMotionIdle(undefined, undefined, now)).toBe(false)
    expect(deriveLiveActivityState(undefined, undefined, now)).toBe('unknown')
  })

  it('idle when recent low score', () => {
    expect(deriveLiveMotionIdle(5, now - 60_000, now)).toBe(true)
  })

  it('active when recent high score', () => {
    expect(deriveLiveMotionIdle(40, now - 60_000, now)).toBe(false)
    expect(deriveLiveActivityState(40, now - 60_000, now)).toBe('active')
  })

  it('idle when stale and low score', () => {
    expect(deriveLiveMotionIdle(8, now - LIVE_MOTION_IDLE_STALE_MS - 1, now)).toBe(true)
  })

  it('not idle when stale but last score was high', () => {
    expect(deriveLiveMotionIdle(50, now - LIVE_MOTION_IDLE_STALE_MS - 1, now)).toBe(false)
  })
})

describe('mergeMotionSample', () => {
  it('blends with previous score', () => {
    const r = mergeMotionSample(20, 80, 5000)
    expect(r.score).toBeGreaterThan(20)
    expect(r.score).toBeLessThan(80)
    expect(r.lastAt).toBe(5000)
  })
})

describe('computeGpsDriftScore', () => {
  it('returns 0 for single point', () => {
    expect(computeGpsDriftScore([{ lat: -33, lng: -71, t: 0 }])).toBe(0)
  })

  it('returns higher score for more movement', () => {
    const still = [
      { lat: -33.0, lng: -71.0, t: 0 },
      { lat: -33.00001, lng: -71.00001, t: 60_000 },
    ]
    const moving = [
      { lat: -33.0, lng: -71.0, t: 0 },
      { lat: -33.002, lng: -71.002, t: 60_000 },
    ]
    expect(computeGpsDriftScore(moving)).toBeGreaterThan(computeGpsDriftScore(still))
  })
})
