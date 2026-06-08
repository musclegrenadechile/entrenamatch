import { describe, expect, it } from 'vitest'
import {
  estimateDispatchPrice,
  findNearbyDispatchTrainers,
  formatDistanceKm,
  haversineKm,
  trainerDistanceKm,
} from './trainerDispatch'
import type { TrainerProfile } from '../types'

function makeTrainer(overrides: Partial<TrainerProfile> = {}): TrainerProfile {
  return {
    userId: 'pt1',
    displayName: 'Coach Test',
    bio: '',
    specialties: ['fuerza'],
    hourlyRateClp: 30000,
    sessionDurationMin: 60,
    city: 'Santiago',
    region: 'RM',
    zones: [],
    paymentMethods: ['cash'],
    active: true,
    verified: false,
    availableForDispatch: true,
    dispatchLat: -33.45,
    dispatchLng: -70.66,
    paymentUrl: 'https://mpago.la/test',
    avgRating: 5,
    reviewCount: 0,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }
}

describe('haversineKm', () => {
  it('returns ~0 for same point', () => {
    expect(haversineKm(-33.45, -70.66, -33.45, -70.66)).toBeLessThan(0.01)
  })

  it('returns positive distance for nearby points', () => {
    const d = haversineKm(-33.45, -70.66, -33.46, -70.67)
    expect(d).toBeGreaterThan(0.5)
    expect(d).toBeLessThan(5)
  })
})

describe('findNearbyDispatchTrainers', () => {
  it('filters by specialty, dispatch availability and radius', () => {
    const trainers = [
      makeTrainer({ userId: 'a', specialties: ['fuerza'] }),
      makeTrainer({ userId: 'b', specialties: ['yoga'], availableForDispatch: true }),
      makeTrainer({ userId: 'c', active: false }),
      makeTrainer({ userId: 'd', availableForDispatch: false }),
    ]
    const nearby = findNearbyDispatchTrainers(trainers, {}, 'fuerza', -33.45, -70.66)
    expect(nearby).toHaveLength(1)
    expect(nearby[0].userId).toBe('a')
  })
})

describe('estimateDispatchPrice', () => {
  it('uses fallback when no trainers nearby', () => {
    const est = estimateDispatchPrice([], 60)
    expect(est.nearbyCount).toBe(0)
    expect(est.surgeFactor).toBe(1)
    expect(est.offerPriceClp).toBe(25000)
  })

  it('applies surge when few trainers', () => {
    const nearby = [
      { ...makeTrainer(), lat: -33.45, lng: -70.66, distanceKm: 1 },
      { ...makeTrainer({ userId: 'pt2' }), lat: -33.46, lng: -70.67, distanceKm: 2 },
    ]
    const est = estimateDispatchPrice(nearby, 60)
    expect(est.surgeFactor).toBe(1.2)
    expect(est.offerPriceClp).toBeGreaterThan(est.marketPriceClp)
  })

  it('applies moderate surge for 3-5 trainers', () => {
    const nearby = Array.from({ length: 4 }, (_, i) => ({
      ...makeTrainer({ userId: `pt${i}` }),
      lat: -33.45,
      lng: -70.66,
      distanceKm: i + 1,
    }))
    const est = estimateDispatchPrice(nearby, 60)
    expect(est.surgeFactor).toBe(1.08)
  })
})

describe('formatDistanceKm', () => {
  it('formats meters under 1km', () => {
    expect(formatDistanceKm(0.5)).toBe('500 m')
  })

  it('formats km', () => {
    expect(formatDistanceKm(2.34)).toBe('2.3 km')
  })
})

describe('trainerDistanceKm', () => {
  it('returns null without user coords', () => {
    expect(trainerDistanceKm(makeTrainer(), {}, undefined, undefined)).toBeNull()
  })
})
