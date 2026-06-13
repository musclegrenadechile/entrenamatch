import { useMemo } from 'react'
import type { Profile, CurrentUser } from '../types'
import type { Filters } from '../hooks/useFilters'
import { getDistanceKm } from '../utils'
import { calculateCompatibility } from '../utils'
import { isDeletedProfile } from '../utils/deletedProfile'
import { isUserLiveInSnapshot } from '../utils/gymPulseLive'

export type ExploreDeckInput = {
  remainingProfiles: Profile[]
  filters: Filters
  userLocation: { lat: number; lng: number } | null
  blockedUsers: string[]
  currentUser: CurrentUser | null
  liveUsersActive: Profile[]
  syncBonds: Record<string, { bondLevel?: number }>
  isSeedProfileId: (id: string) => boolean
}

/** Fase 396 — filtra y ordena el deck de Explorar (red → distancia → compat). */
export function buildExploreDeck(input: ExploreDeckInput): Profile[] {
  const {
    remainingProfiles,
    filters,
    userLocation,
    blockedUsers,
    currentUser,
    liveUsersActive,
    syncBonds,
    isSeedProfileId,
  } = input

  const filtered = remainingProfiles.filter((p) => {
    if (isDeletedProfile(p)) return false
    if (blockedUsers.includes(p.id)) return false
    if (p.age < filters.minAge || p.age > filters.maxAge) return false
    if (filters.gender !== 'todos' && p.gender !== filters.gender) return false
    if (filters.trainingTypes.length > 0) {
      const hasAny = filters.trainingTypes.some((t) => p.trainingTypes.includes(t))
      if (!hasAny) return false
    }
    if (filters.availability.length > 0) {
      const hasTime = filters.availability.some((t) => p.availability.includes(t))
      if (!hasTime) return false
    }
    if (userLocation && filters.maxDistanceKm < 100) {
      const dist = getDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng)
      if (dist > filters.maxDistanceKm) return false
    }
    if (filters.onlyAvailableToday && !p.availableToday) return false
    if (filters.onlyLiveTraining && !isUserLiveInSnapshot(p.id, liveUsersActive)) return false
    if (filters.onlyRealProfiles && isSeedProfileId(p.id)) return false
    return true
  })

  if (!currentUser) return filtered

  return [...filtered].sort((a, b) => {
    const isNetA = !!syncBonds[a.id]
    const isNetB = !!syncBonds[b.id]
    if (isNetA && !isNetB) return -1
    if (!isNetA && isNetB) return 1
    if (isNetA && isNetB) {
      const la = syncBonds[a.id]?.bondLevel || 1
      const lb = syncBonds[b.id]?.bondLevel || 1
      if (lb !== la) return lb - la
    }

    if (userLocation) {
      const da = getDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng)
      const db = getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
      if (da !== db) return da - db
    }

    const ca = calculateCompatibility(currentUser, a, userLocation) + (isNetA ? 75 : 0)
    const cb = calculateCompatibility(currentUser, b, userLocation) + (isNetB ? 75 : 0)
    if (cb !== ca) return cb - ca

    const va = a.verificationStatus === 'verified' || !a.id.startsWith('p') ? 1 : 0
    const vb = b.verificationStatus === 'verified' || !b.id.startsWith('p') ? 1 : 0
    return vb - va
  })
}

export function useExploreDeck(
  remainingProfiles: Profile[],
  filters: Filters,
  userLocation: { lat: number; lng: number } | null,
  blockedUsers: string[],
  currentUser: CurrentUser | null,
  liveUsersActive: Profile[],
  syncBonds: Record<string, { bondLevel?: number }>,
  isSeedProfileId: (id: string) => boolean
): Profile[] {
  return useMemo(
    () =>
      buildExploreDeck({
        remainingProfiles,
        filters,
        userLocation,
        blockedUsers,
        currentUser,
        liveUsersActive,
        syncBonds,
        isSeedProfileId,
      }),
    [
      remainingProfiles,
      filters,
      userLocation,
      blockedUsers,
      currentUser,
      liveUsersActive,
      syncBonds,
      isSeedProfileId,
    ]
  )
}
