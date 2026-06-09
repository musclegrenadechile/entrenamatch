/** Identity verification — AI result thresholds and status resolution. */

export type IdentityVerificationStatus = 'unverified' | 'pending' | 'verified'

export type IdentityAiVerdict = {
  samePerson: boolean
  confidence: number
  profileMatch: boolean
  selfieHasFace: boolean
  idDocumentReadable: boolean
  reason: string
  source: 'gemini' | 'unavailable'
  geminiModel?: string
  geminiErrorMessage?: string
}

export const IDENTITY_VERIFY_MIN_CONFIDENCE = 0.72
/** High-confidence mismatch — only then hard-reject with a visible face. */
export const IDENTITY_REJECT_MIN_CONFIDENCE = 0.72

export function resolveVerificationStatusFromAi(
  verdict: IdentityAiVerdict
): IdentityVerificationStatus {
  if (verdict.source !== 'gemini') return 'pending'
  if (!verdict.selfieHasFace) return 'unverified'

  if (
    verdict.samePerson &&
    verdict.confidence >= IDENTITY_VERIFY_MIN_CONFIDENCE &&
    (verdict.profileMatch || verdict.confidence >= 0.78)
  ) {
    return 'verified'
  }

  if (!verdict.samePerson && verdict.confidence >= IDENTITY_REJECT_MIN_CONFIDENCE) {
    return 'unverified'
  }

  return 'pending'
}

export function isProfileVerified(status: IdentityVerificationStatus | undefined): boolean {
  return status === 'verified'
}

export function verificationStatusLabel(status: IdentityVerificationStatus | undefined): string {
  if (status === 'verified') return 'Verificado'
  if (status === 'pending') return 'En revisión'
  return 'Sin verificar'
}
