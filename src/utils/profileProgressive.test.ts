import { describe, expect, it } from 'vitest'
import {
  getAccountAgeDays,
  isHomeDayOneMode,
  isProfileProgressiveMode,
  shouldHideCoachAndMarketplace,
} from './profileProgressive'

describe('profileProgressive (fase 88)', () => {
  it('treats missing consent as veteran (not progressive)', () => {
    expect(isProfileProgressiveMode(null)).toBe(false)
  })

  it('progressive within 7 days of signup', () => {
    const user = { legalConsents: { acceptedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 } }
    expect(getAccountAgeDays(user)).toBe(2)
    expect(isProfileProgressiveMode(user)).toBe(true)
  })

  it('full profile after 7 days', () => {
    const user = { legalConsents: { acceptedAt: Date.now() - 8 * 24 * 60 * 60 * 1000 } }
    expect(isProfileProgressiveMode(user)).toBe(false)
  })

  it('home day one mode for accounts <24h', () => {
    const user = { legalConsents: { acceptedAt: Date.now() - 12 * 60 * 60 * 1000 } }
    expect(isHomeDayOneMode(user)).toBe(true)
  })

  it('hides coach/shop until 2 syncs or 7 days', () => {
    const young = { legalConsents: { acceptedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 } }
    expect(shouldHideCoachAndMarketplace(young, 0)).toBe(true)
    expect(shouldHideCoachAndMarketplace(young, 1)).toBe(true)
    expect(shouldHideCoachAndMarketplace(young, 2)).toBe(false)
    const veteran = { legalConsents: { acceptedAt: Date.now() - 8 * 24 * 60 * 60 * 1000 } }
    expect(shouldHideCoachAndMarketplace(veteran, 0)).toBe(false)
  })
})
