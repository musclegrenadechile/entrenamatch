import type { Profile } from '../types'
import { normalizeCity } from '../services/localNetwork'
import { getDistanceKm } from './index'

/** Contextual demo seeds: prefer same city, then nearest in Chile. */
export function filterSeedsForCity(seeds: Profile[], userCity?: string | null): Profile[] {
  if (!seeds.length) return seeds
  const norm = normalizeCity(userCity)
  if (norm) {
    const sameCity = seeds.filter((p) => normalizeCity(p.city) === norm)
    if (sameCity.length >= 3) return sameCity
  }
  const chileCities = new Set(['vina del mar', 'valparaiso', 'santiago', 'concon'])
  const chile = seeds.filter((p) => chileCities.has(normalizeCity(p.city)))
  if (chile.length >= 3) return chile.slice(0, 8)
  return seeds.slice(0, 6)
}

export function approximateDistanceKm(
  profile: Profile,
  userCity?: string | null,
  userLoc?: { lat: number; lng: number } | null
): number | null {
  if (userLoc && Number.isFinite(profile.lat) && Number.isFinite(profile.lng)) {
    return getDistanceKm(userLoc.lat, userLoc.lng, profile.lat, profile.lng)
  }
  return null
}
