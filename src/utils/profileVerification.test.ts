import { describe, expect, it } from 'vitest'
import { enrichProfileFromDirectory, isPubliclyVerified } from './profileVerification'

describe('profileVerification', () => {
  it('enriches verification from directory', () => {
    const stale = { id: 'u1', name: 'Jorge', photos: ['a'], verificationStatus: undefined as never }
    const fresh = { id: 'u1', name: 'Jorge', photos: ['a'], verificationStatus: 'verified' as const }
    const merged = enrichProfileFromDirectory(stale as never, [fresh as never])
    expect(merged.verificationStatus).toBe('verified')
    expect(isPubliclyVerified(merged)).toBe(true)
  })
})
