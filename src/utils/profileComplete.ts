import { isOpenPilotCity } from '../constants/pilotProgram'

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

/** Minimum profile fields before entering the main app (fase 101). */
export function isProfileComplete(profile: ProfileCompleteInput | null | undefined): boolean {
  if (!profile?.name?.trim()) return false
  const photos = profile.photos
  if (!Array.isArray(photos) || photos.length === 0) return false
  if (!profile.bio?.trim()) return false
  if (!isOpenPilotCity(profile.city)) return false
  const types = profile.trainingTypes
  if (!Array.isArray(types) || types.length === 0) return false
  const lc = profile.legalConsents
  if (!lc?.is18 || !lc?.isForTraining || !lc?.sharesLocation) return false
  return true
}
