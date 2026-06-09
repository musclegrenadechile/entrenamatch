/** Fase 86 — ?gym=partnerId deep link for partner check-in. */

import type { PartnerLocation } from '../types'

export function parseGymIdFromSearch(search = window.location.search): string | null {
  try {
    const id = new URLSearchParams(search).get('gym')?.trim()
    return id || null
  } catch {
    return null
  }
}

export function resolvePartnerGymById(
  gymId: string,
  partners: PartnerLocation[]
): PartnerLocation | null {
  if (!gymId) return null
  return partners.find((p) => p.id === gymId) ?? null
}

export function clearGymDeepLinkParam() {
  try {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('gym')) return
    url.searchParams.delete('gym')
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  } catch {
    /* ignore */
  }
}
