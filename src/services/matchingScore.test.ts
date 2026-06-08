import { describe, expect, it } from 'vitest'
import { computeMatchScore, timezoneTrainingBonus } from './matchingScore'

describe('timezoneTrainingBonus', () => {
  it('gives max bonus for same offset', () => {
    expect(timezoneTrainingBonus(-180, -180)).toBe(8)
  })

  it('gives zero for large offset diff', () => {
    expect(timezoneTrainingBonus(0, 600)).toBe(0)
  })
})

describe('computeMatchScore', () => {
  it('caps at 100', () => {
    const user = {
      trainingTypes: ['fuerza'],
      goals: ['masa'],
      level: 'Intermedio',
      availability: ['mañana'],
      intensity: 'Moderado',
    }
    const profile = {
      trainingTypes: ['fuerza'],
      goals: ['masa'],
      level: 'Intermedio',
      availability: ['mañana'],
      intensity: 'Moderado',
      lat: -33.45,
      lng: -70.66,
    }
    const score = computeMatchScore(user, profile, { lat: -33.45, lng: -70.66 })
    expect(score).toBeLessThanOrEqual(100)
    expect(score).toBeGreaterThan(50)
  })
})
