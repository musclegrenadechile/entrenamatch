import { describe, expect, it } from 'vitest'
import { clampCropOffset, minCoverZoom } from './cropImage'

describe('cropImage', () => {
  it('computes min cover zoom', () => {
    expect(minCoverZoom(1000, 2000, 300, 300)).toBeCloseTo(0.3)
    expect(minCoverZoom(2000, 1000, 300, 300)).toBeCloseTo(0.3)
  })

  it('clamps offsets inside bounds', () => {
    const clamped = clampCropOffset(500, -500, 400, 800, 300, 300)
    expect(clamped.x).toBe(50)
    expect(clamped.y).toBe(-250)
  })
})
