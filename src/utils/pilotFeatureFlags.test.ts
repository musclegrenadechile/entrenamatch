import { describe, expect, it } from 'vitest'
import { isMarketplaceUiEnabled, isMonetizationUnlocked } from './pilotFeatureFlags'

describe('pilotFeatureFlags — marketplace UI gate', () => {
  it('marketplace UI is off by default in beta', () => {
    expect(isMarketplaceUiEnabled()).toBe(false)
  })

  it('monetization still requires maturity when env flag is off', () => {
    const young = { legalConsents: { acceptedAt: Date.now() } }
    expect(isMonetizationUnlocked(young, { syncSessionCount: 0, pilotMau: 100 })).toBe(false)
  })
})
