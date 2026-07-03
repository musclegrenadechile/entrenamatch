import { isRegistrationCity } from '../constants/pilotProgram'

export type ProfileCompleteInput = {
  name?: string | null
  photos?: string[] | null
  bio?: string | null
  city?: string | null
  trainingTypes?: string[] | null
  legalConsents?: {
    is18?: boolean
    isForTraining?: boolean
    sharesLocation?: boolean
  } | null
}

/** Core fields a returning user would have filled during first onboarding. */
export function hasCoreProfileFields(profile: ProfileCompleteInput | null | undefined): boolean {
  if (!profile?.name?.trim()) return false
  const photos = profile.photos
  if (!Array.isArray(photos) || photos.length === 0) return false
  if (!profile.bio?.trim()) return false
  if (!isRegistrationCity(profile.city)) return false
  const types = profile.trainingTypes
  if (!Array.isArray(types) || types.length === 0) return false
  return true
}

/**
 * Profiles created before legalConsents were persisted still have full data in Firestore.
 * Treat them as complete so login on a new domain does not force a blank onboarding.
 */
export function enrichReturningProfile<T extends ProfileCompleteInput>(
  profile: T | null | undefined
): T | null | undefined {
  if (!profile || isProfileCompleteStrict(profile) || !hasCoreProfileFields(profile)) return profile
  const lc = profile.legalConsents
  // Only backfill when the consent block was never saved (legacy Firestore docs).
  if (lc) return profile
  return {
    ...profile,
    legalConsents: {
      acceptedAt: Date.now(),
      termsVersion: 'v1.1',
      privacyVersion: 'v1.1',
      communityVersion: 'v1.0',
      is18: true,
      isForTraining: true,
      sharesLocation: true,
    },
  }
}

function isProfileCompleteStrict(profile: ProfileCompleteInput | null | undefined): boolean {
  if (!profile?.name?.trim()) return false
  const photos = profile.photos
  if (!Array.isArray(photos) || photos.length === 0) return false
  if (!profile.bio?.trim()) return false
  if (!isRegistrationCity(profile.city)) return false
  const types = profile.trainingTypes
  if (!Array.isArray(types) || types.length === 0) return false
  const lc = profile.legalConsents
  if (!lc?.is18 || !lc?.isForTraining || !lc?.sharesLocation) return false
  return true
}

/** Minimum profile fields before entering the main app (fase 101). */
export function isProfileComplete(profile: ProfileCompleteInput | null | undefined): boolean {
  return isProfileCompleteStrict(enrichReturningProfile(profile))
}
