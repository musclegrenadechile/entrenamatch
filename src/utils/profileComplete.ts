/** Minimum profile fields required before entering the main app (fase 162). */
export function isProfileComplete(
  profile: { name?: string | null; photos?: string[] | null } | null | undefined
): boolean {
  if (!profile?.name?.trim()) return false
  const photos = profile.photos
  if (!Array.isArray(photos) || photos.length === 0) return false
  return true
}
