import { describe, expect, it } from 'vitest'
import { resolveCityZone, CITY_ZONES, cityZonePolygonLatLngs } from './cityZoneBounds'
import { normalizeCity } from './localNetwork'

describe('cityZoneBounds', () => {
  it('resolves known Chile cities', () => {
    expect(resolveCityZone('Viña del Mar')?.label).toBe('Viña del Mar')
    expect(resolveCityZone('Santiago')?.center.lat).toBeLessThan(-33)
  })

  it('normalizes accents for lookup', () => {
    const key = normalizeCity('Viña del Mar')
    expect(CITY_ZONES[key]).toBeDefined()
  })

  it('returns null for unknown city', () => {
    expect(resolveCityZone('Tokyo')).toBeNull()
  })

  it('builds hex polygon for overlay', () => {
    const zone = resolveCityZone('Viña del Mar')
    expect(zone).not.toBeNull()
    const poly = cityZonePolygonLatLngs(zone!)
    expect(poly.length).toBe(6)
  })
})
