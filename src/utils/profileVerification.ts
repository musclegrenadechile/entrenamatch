import type { Profile } from '../types'
import { isProfileVerified } from './identityVerification'

/** Beneficios visibles del premio “Identidad verificada”. */
export const VERIFICATION_PERK_LABELS = [
  'Badge visible en mapa, explore y chat',
  'Prioridad en matches y confianza en sync',
  'Señal anti-suplantación para tu red',
] as const

/** Fusiona datos frescos del directorio (Firestore) al abrir un perfil ajeno. */
export function enrichProfileFromDirectory(
  profile: Profile,
  directory: Profile[]
): Profile {
  const fresh = directory.find((p) => p.id === profile.id)
  if (!fresh) return profile
  return {
    ...profile,
    ...fresh,
    verificationStatus: fresh.verificationStatus ?? profile.verificationStatus,
    verificationDate:
      (fresh as Profile & { verificationDate?: number }).verificationDate ??
      (profile as Profile & { verificationDate?: number }).verificationDate,
    photos: fresh.photos?.length ? fresh.photos : profile.photos,
  }
}

export function isPubliclyVerified(profile: Profile | null | undefined): boolean {
  return isProfileVerified(profile?.verificationStatus)
}
