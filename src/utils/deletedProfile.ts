/** Soft-deleted accounts (admin) — keep a stub doc but hide from discovery. */

export function isDeletedProfileData(
  data: Record<string, unknown> | null | undefined
): boolean {
  if (!data) return true
  if (data.accountStatus === 'deleted') return true
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
  const name = String(profile.name || '')
    .trim()
    .toLowerCase()
  return name === 'cuenta eliminada'
}
