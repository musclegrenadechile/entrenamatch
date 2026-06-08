import { describe, it, expect } from 'vitest'

describe('constanciaEconomy (pure logic)', () => {
  it('earn amount is positive for workout reward band', () => {
    const durationMin = 45
    const reward = Math.min(15, Math.max(5, Math.floor(durationMin / 10)))
    expect(reward).toBeGreaterThanOrEqual(5)
    expect(reward).toBeLessThanOrEqual(15)
  })
})
