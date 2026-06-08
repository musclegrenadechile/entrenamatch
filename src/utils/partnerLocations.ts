/** Demo-only partner IDs — never show on map in real Firebase mode (fase 118). */
export function isDemoPartnerSeed(id: string | undefined): boolean {
  if (!id) return false
  return id.startsWith('p-seed-')
}

export function partnersForMap<T extends { id?: string }>(
  partners: T[],
  demoMode: boolean
): T[] {
  if (demoMode) return partners
  return partners.filter((p) => !isDemoPartnerSeed(p.id))
}
