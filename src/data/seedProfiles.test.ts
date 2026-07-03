import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { SEED_PROFILES, CHAT_OPENERS } from '../data/seedProfiles'
import { isSeedProfileId } from '../utils/seedProfiles'

describe('seedProfiles data — fase 451', () => {
  it('exports demo profiles p1–p45', () => {
    expect(SEED_PROFILES.length).toBeGreaterThanOrEqual(45)
    expect(SEED_PROFILES[0].id).toBe('p1')
    expect(SEED_PROFILES.some((p) => p.city === 'Lima')).toBe(true)
    expect(SEED_PROFILES.some((p) => p.city === 'Miami')).toBe(true)
  })

  it('chat openers keyed by seed id', () => {
    expect(CHAT_OPENERS.p1?.length).toBeGreaterThan(0)
    expect(isSeedProfileId('p12')).toBe(true)
    expect(isSeedProfileId('firebase-uid')).toBe(false)
  })
})

describe('appLineCount — fase 459', () => {
  it('App.tsx stays under 12_500 lines while oleada H continues', () => {
    const appPath = resolve(process.cwd(), 'src/App.tsx')
    const lines = readFileSync(appPath, 'utf8').split('\n').length
    expect(lines).toBeLessThan(12_500)
  })
})
