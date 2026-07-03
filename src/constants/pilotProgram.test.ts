import { describe, expect, it } from 'vitest'
import {
  REGISTRATION_COUNTRIES,
  applyRegistrationCitySelection,
  applyRegistrationCountrySelection,
  getRegistrationCitiesForCountry,
  isOpenPilotCity,
  resolveRegistrationCity,
  canonicalProfileLocation,
} from './pilotProgram'

describe('pilotProgram registration regions', () => {
  it('lists Chile, Perú, México and Estados Unidos', () => {
    expect(REGISTRATION_COUNTRIES).toEqual(['Chile', 'Perú', 'México', 'Estados Unidos'])
  })

  it('returns Chile cities per country (major communes)', () => {
    const chile = getRegistrationCitiesForCountry('Chile').map((c) => c.label)
    expect(chile).toContain('Viña del Mar')
    expect(chile).toContain('Concepción')
    expect(chile).toContain('Punta Arenas')
    expect(chile.length).toBeGreaterThan(50)
    expect(getRegistrationCitiesForCountry('Perú').map((c) => c.label)).toContain('Lima')
    expect(getRegistrationCitiesForCountry('México').map((c) => c.label)).toContain('Ciudad de México')
    expect(getRegistrationCitiesForCountry('Estados Unidos').map((c) => c.label)).toContain('Miami')
  })

  it('applyRegistrationCountrySelection picks first city with coords', () => {
    const mx = applyRegistrationCountrySelection('México')
    expect(mx.country).toBe('México')
    expect(mx.city).toBe('Ciudad de México')
    expect(mx.lat).toBeCloseTo(19.43, 1)
  })

  it('applyRegistrationCitySelection sets country from city', () => {
    const lima = applyRegistrationCitySelection('Lima')
    expect(lima.country).toBe('Perú')
    expect(lima.city).toBe('Lima')
    expect(isOpenPilotCity('Lima')).toBe(false)
    expect(isOpenPilotCity('Viña del Mar')).toBe(true)
    expect(isOpenPilotCity('Concepción')).toBe(false)
  })

  it('resolveRegistrationCity matches label or normalized form', () => {
    expect(resolveRegistrationCity('Concón')?.label).toBe('Concón')
    expect(resolveRegistrationCity('vina del mar')?.label).toBe('Viña del Mar')
    expect(canonicalProfileLocation('concón', 'Chile').city).toBe('Concón')
    expect(resolveRegistrationCity('Concepción')?.label).toBe('Concepción')
  })
})
