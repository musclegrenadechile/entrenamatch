import { describe, expect, it } from 'vitest'
import { buildExploreDeck } from '../hooks/useExploreDeck'
import type { Profile } from '../types'

const baseProfile = (id: string, overrides: Partial<Profile> = {}): Profile => ({
  id,
  name: `User ${id}`,
  age: 30,
  gender: 'hombre',
  city: 'Santiago',
  country: 'Chile',
  lat: -33.45,
  lng: -70.66,
  bio: '',
  photos: [],
  trainingTypes: ['Pesas/Gym'],
  goals: [],
  level: 'Intermedio',
  availability: ['Tarde'],
  ...overrides,
})

const defaultFilters = {
  minAge: 18,
  maxAge: 70,
  gender: 'todos' as const,
  trainingTypes: [] as string[],
  availability: [] as string[],
  maxDistanceKm: 100,
  onlyAvailableToday: false,
  onlyLiveTraining: false,
  onlyRealProfiles: false,
}

describe('useExploreDeck', () => {
  it('filters by age range', () => {
    const deck = buildExploreDeck({
      remainingProfiles: [baseProfile('a', { age: 25 }), baseProfile('b', { age: 75 })],
      filters: { ...defaultFilters, maxAge: 50 },
      userLocation: null,
      blockedUsers: [],
      currentUser: null,
      liveUsersActive: [],
      syncBonds: {},
      isSeedProfileId: () => false,
    })
    expect(deck.map((p) => p.id)).toEqual(['a'])
  })

  it('sorts network bonds before others', () => {
    const deck = buildExploreDeck({
      remainingProfiles: [baseProfile('far', { lat: -33.0 }), baseProfile('bond', { lat: -34.0 })],
      filters: defaultFilters,
      userLocation: { lat: -33.45, lng: -70.66 },
      blockedUsers: [],
      currentUser: baseProfile('me', { id: 'me' }),
      liveUsersActive: [],
      syncBonds: { bond: { bondLevel: 2 } },
      isSeedProfileId: () => false,
    })
    expect(deck[0].id).toBe('bond')
  })
})
