import { describe, expect, it } from 'vitest'
import {
  REGISTRATION_COUNTRIES,
  applyRegistrationCitySelection,
  applyRegistrationCountrySelection,
  getRegistrationCitiesForCountry,
  isOpenPilotCity,
} from './pilotProgram'

describe('pilotProgram registration regions', () => {
  it('lists Chile, Perú, México and Estados Unidos', () => {
    expect(REGISTRATION_COUNTRIES).toEqual(['Chile', 'Perú', 'México', 'Estados Unidos'])
  })

  it('returns cities per country', () => {
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
    expect(isOpenPilotCity('Lima')).toBe(true)
    expect(isOpenPilotCity('Miami')).toBe(true)
    expect(isOpenPilotCity('Concepción')).toBe(false)
  })
})
