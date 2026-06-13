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

  it('builds query terms with canonical label', () => {
    const terms = buildDiscoveryCityQueryTerms('vina del mar')
    expect(terms).toContain('vina del mar')
    expect(terms).toContain('Viña del Mar')
  })

  it('matches profiles in same zone by normalized city', () => {
    expect(
      profileMatchesDiscoveryZone(
        { city: 'Viña del Mar', country: 'Chile' },
        { city: 'vina del mar', country: 'Chile' }
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

  it('picks canonical city for realtime listener', () => {
    expect(primaryDiscoveryCityForListener('lima')).toBe('Lima')
    expect(primaryDiscoveryCityForListener('Viña del Mar')).toBe('Viña del Mar')
  })
})
