import { describe, expect, it } from 'vitest'
import { formatLiveDistanceKm } from './formatLiveDistance'

describe('formatLiveDistanceKm', () => {
  it('returns null for missing or sentinel distances', () => {
    expect(formatLiveDistanceKm(undefined)).toBeNull()
    expect(formatLiveDistanceKm(null)).toBeNull()
    expect(formatLiveDistanceKm(999)).toBeNull()
    expect(formatLiveDistanceKm(-1)).toBeNull()
    expect(formatLiveDistanceKm(Number.NaN)).toBeNull()
  })

  it('labels very close athletes without showing a dash', () => {
    expect(formatLiveDistanceKm(0)).toBe('cerca')
    expect(formatLiveDistanceKm(0.04)).toBe('cerca')
  })

  it('formats normal distances with one decimal', () => {
    expect(formatLiveDistanceKm(0.5)).toBe('0.5 km')
    expect(formatLiveDistanceKm(12.34)).toBe('12.3 km')
  })
})
