import { describe, expect, it } from 'vitest'
import {
  buildDiscoveryCityQueryTerms,
  profileMatchesDiscoveryZone,
  primaryDiscoveryCityForListener,
  resolveDiscoveryCityNorm,
} from './profileDiscoveryQuery'

describe('profileDiscoveryQuery', () => {
  it('resolves registration city norms with diacritics', () => {
    expect(resolveDiscoveryCityNorm('Viña del Mar')).toBe('vina del mar')
    expect(resolveDiscoveryCityNorm('vina del mar')).toBe('vina del mar')
    expect(resolveDiscoveryCityNorm('Lima')).toBe('lima')
  })

  it('builds query terms with canonical label and legacy aliases', () => {
    const terms = buildDiscoveryCityQueryTerms('vina del mar')
    expect(terms).toContain('vina del mar')
    expect(terms).toContain('Viña del Mar')
    expect(terms).toContain('Vina del Mar')
    const concon = buildDiscoveryCityQueryTerms('Concón')
    expect(concon).toContain('Concon')
    expect(concon).toContain('Concón')
  })

  it('matches profiles in same country (any city) when country is set', () => {
    expect(
      profileMatchesDiscoveryZone(
        { city: 'Viña del Mar', country: 'Chile' },
        { city: 'vina del mar', country: 'Chile' }
      )
    ).toBe(true)
    expect(
      profileMatchesDiscoveryZone(
        { city: 'Valparaíso', country: 'Chile' },
        { city: 'Viña del Mar', country: 'Chile' }
      )
    ).toBe(true)
    expect(
      profileMatchesDiscoveryZone(
        { city: 'Lima', country: 'Perú' },
        { city: 'Viña del Mar', country: 'Chile' }
      )
    ).toBe(false)
  })

  it('falls back to country when city norm empty', () => {
    expect(
      profileMatchesDiscoveryZone(
        { city: 'Lima', country: 'Perú' },
        { city: '', country: 'Perú' }
      )
    ).toBe(true)
  })

  it('primaryDiscoveryCityForListener includes legacy alias terms', () => {
    const terms = buildDiscoveryCityQueryTerms('Viña del Mar')
    expect(terms).toContain('Viña del Mar')
    expect(primaryDiscoveryCityForListener('lima')).toBe('Lima')
  })
})
