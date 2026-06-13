import { describe, expect, it } from 'vitest'
import { BRAND_COPY } from '../constants/brandCopy'
import type { Profile } from '../types'
import {
  displayMatchName,
  formatProfileLocation,
  hasReliableMapCoords,
  isGenericPartnerName,
  isIncompleteMatchProfile,
} from './matchProfileDisplay'

const baseProfile = (overrides: Partial<Profile> = {}): Profile =>
  ({
    id: 'u1',
    name: 'Jorge',
    age: 30,
    gender: 'hombre',
    city: 'Santiago',
    country: 'Chile',
    lat: -33.45,
    lng: -70.66,
    bio: '',
    photos: ['https://example.com/p.jpg'],
    trainingTypes: [],
    goals: [],
    level: 'Intermedio',
    availability: ['Tarde'],
    ...overrides,
  }) as Profile

describe('matchProfileDisplay', () => {
  it('detects generic partner names', () => {
    expect(isGenericPartnerName(BRAND_COPY.partnerGeneric)).toBe(true)
    expect(isGenericPartnerName('Jorge')).toBe(false)
  })

  it('flags incomplete profiles without photo and generic name', () => {
    expect(isIncompleteMatchProfile(baseProfile({ photos: [] }))).toBe(false)
    expect(
      isIncompleteMatchProfile(
        baseProfile({ name: BRAND_COPY.partnerGeneric, photos: [] })
      )
    ).toBe(true)
  })

  it('formats location without empty city comma', () => {
    expect(formatProfileLocation('', 'Chile')).toBe('Chile')
    expect(formatProfileLocation('Valparaíso', 'Chile')).toBe('Valparaíso, Chile')
  })

  it('hides default map coords', () => {
    expect(hasReliableMapCoords(baseProfile())).toBe(true)
    expect(hasReliableMapCoords(baseProfile({ lat: -33, lng: -71 }))).toBe(false)
  })

  it('uses short display name for generic profiles', () => {
    expect(displayMatchName({ name: BRAND_COPY.partnerGeneric })).toBe('Compañero')
    expect(displayMatchName({ name: 'Jorge Erpel' })).toBe('Jorge Erpel')
  })
})
