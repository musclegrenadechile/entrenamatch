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

  it('home compact mode for accounts under 3 days', () => {
    const day1 = { legalConsents: { acceptedAt: Date.now() - 12 * 60 * 60 * 1000 } }
    const day2 = { legalConsents: { acceptedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 } }
    const day4 = { legalConsents: { acceptedAt: Date.now() - 4 * 24 * 60 * 60 * 1000 } }
    expect(isHomeDayOneMode(day1)).toBe(true)
    expect(isHomeDayOneMode(day2)).toBe(true)
    expect(isHomeDayOneMode(day4)).toBe(false)
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
