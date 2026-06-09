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

export const IDENTITY_VERIFY_MIN_CONFIDENCE = 0.82
export const IDENTITY_PENDING_MIN_CONFIDENCE = 0.55

export function resolveVerificationStatusFromAi(
  verdict: IdentityAiVerdict
): IdentityVerificationStatus {
  if (verdict.source !== 'gemini') return 'pending'
  if (
    verdict.samePerson &&
    verdict.profileMatch &&
    verdict.selfieHasFace &&
    verdict.confidence >= IDENTITY_VERIFY_MIN_CONFIDENCE
  ) {
    return 'verified'
  }
  if (
    verdict.selfieHasFace &&
    verdict.samePerson &&
    verdict.confidence >= IDENTITY_PENDING_MIN_CONFIDENCE
  ) {
    return 'pending'
  }
  return 'unverified'
}

export function verificationStatusLabel(status: IdentityVerificationStatus | undefined): string {
  if (status === 'verified') return 'Verificado'
  if (status === 'pending') return 'En revisión'
  return 'Sin verificar'
}
