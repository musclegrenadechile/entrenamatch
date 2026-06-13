/** Soft-deleted / suspended accounts (admin) — keep stub doc but hide from discovery. */

export function isSuspendedProfileData(
  data: Record<string, unknown> | null | undefined
): boolean {
  return data?.accountStatus === 'suspended'
}

export function isSuspendedProfile(
  profile: { accountStatus?: string } | null | undefined
): boolean {
  return profile?.accountStatus === 'suspended'
}

export function isDeletedProfileData(
  data: Record<string, unknown> | null | undefined
): boolean {
  if (!data) return true
  if (data.accountStatus === 'deleted') return true
  if (isSuspendedProfileData(data)) return true
  const name = String(data.name || '')
    .trim()
    .toLowerCase()
  return name === 'cuenta eliminada'
}

export function isDeletedProfile(
  profile: { accountStatus?: string; name?: string } | null | undefined
): boolean {
  if (!profile) return true
  if (profile.accountStatus === 'deleted') return true
  if (isSuspendedProfile(profile)) return true
  const name = String(profile.name || '')
    .trim()
    .toLowerCase()
  return name === 'cuenta eliminada'
}
