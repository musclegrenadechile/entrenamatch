import { describe, expect, it } from 'vitest'
import {
  IDENTITY_REJECT_MIN_CONFIDENCE,
  IDENTITY_VERIFY_MIN_CONFIDENCE,
  resolveVerificationStatusFromAi,
  type IdentityAiVerdict,
} from './identityVerification'

function verdict(partial: Partial<IdentityAiVerdict>): IdentityAiVerdict {
  return {
    samePerson: false,
    confidence: 0,
    profileMatch: false,
    selfieHasFace: false,
    idDocumentReadable: false,
    reason: 'test',
    source: 'gemini',
    ...partial,
  }
}

describe('identityVerification', () => {
  it('verifies high-confidence same-person match', () => {
    const status = resolveVerificationStatusFromAi(
      verdict({
        samePerson: true,
        profileMatch: true,
        selfieHasFace: true,
        confidence: IDENTITY_VERIFY_MIN_CONFIDENCE,
      })
    )
    expect(status).toBe('verified')
  })

  it('pending on ambiguous same-person match', () => {
    const status = resolveVerificationStatusFromAi(
      verdict({
        samePerson: true,
        profileMatch: false,
        selfieHasFace: true,
        confidence: 0.5,
      })
    )
    expect(status).toBe('pending')
  })

  it('rejects only high-confidence mismatch or missing face', () => {
    expect(
      resolveVerificationStatusFromAi(
        verdict({
          samePerson: false,
          selfieHasFace: true,
          confidence: IDENTITY_REJECT_MIN_CONFIDENCE,
        })
      )
    ).toBe('unverified')
    expect(
      resolveVerificationStatusFromAi(
        verdict({ samePerson: true, selfieHasFace: false, confidence: 0.95 })
      )
    ).toBe('unverified')
    expect(
      resolveVerificationStatusFromAi(
        verdict({ samePerson: false, selfieHasFace: true, confidence: 0.4 })
      )
    ).toBe('pending')
  })

  it('pending when Gemini unavailable', () => {
    expect(
      resolveVerificationStatusFromAi(verdict({ source: 'unavailable', confidence: 0.99 }))
    ).toBe('pending')
  })
})
