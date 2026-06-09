import { describe, expect, it } from 'vitest'
import {
  GYMPULSE_MAPLIBRE_STYLE_URL,
  resolveGymPulseUseMaplibre,
} from './gymPulseMapConfig'

describe('gymPulseMapConfig', () => {
  it('enables MapLibre only when VITE_MAP_USE_MAPLIBRE=1', () => {
    expect(resolveGymPulseUseMaplibre(undefined)).toBe(false)
    expect(resolveGymPulseUseMaplibre({})).toBe(false)
    expect(resolveGymPulseUseMaplibre({ VITE_MAP_USE_MAPLIBRE: '0' })).toBe(false)
    expect(resolveGymPulseUseMaplibre({ VITE_MAP_USE_MAPLIBRE: '1' })).toBe(true)
  })

  it('has a default MapLibre style URL', () => {
    expect(GYMPULSE_MAPLIBRE_STYLE_URL).toContain('style.json')
  })
})
