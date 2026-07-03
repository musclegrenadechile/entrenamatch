import { describe, expect, it } from 'vitest'
import { buildE2EDemoFuelProfile } from './demoFuelProfile'

describe('demoFuelProfile', () => {
  it('buildE2EDemoFuelProfile — perfil válido para EntrenaPlan', () => {
    const p = buildE2EDemoFuelProfile()
    expect(p.weightKg).toBe(75)
    expect(p.goal).toBe('muscle')
    expect(p.targetKcal).toBeGreaterThan(0)
    expect(p.targetProteinG).toBeGreaterThan(0)
  })
})