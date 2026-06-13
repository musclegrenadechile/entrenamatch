import { BRAND_COPY } from '../constants/brandCopy'
import type { Profile } from '../types'
import { primaryProfilePhoto } from './profilePhotos'

const DEFAULT_COORD_EPS = 0.02

export function isGenericPartnerName(name: string | undefined | null): boolean {
  const n = (name || '').trim().toLowerCase()
  if (!n) return true
  return (
    n === BRAND_COPY.partnerGeneric.toLowerCase() ||
    n === 'socio' ||
    n === 'usuario' ||
    n === 'compañero' ||
    n === 'companero'
  )
}

export function hasDisplayableMatchPhoto(photos: string[] | undefined | null): boolean {
  return !!primaryProfilePhoto(photos)
}

/** Profile fetched but still missing real identity for match cards. */
export function isIncompleteMatchProfile(profile: Profile): boolean {
  if (isGenericPartnerName(profile.name) && !hasDisplayableMatchPhoto(profile.photos)) return true
  return false
}

export function displayMatchName(profile: Pick<Profile, 'name'>): string {
  const raw = (profile.name || '').trim()
  if (!raw || isGenericPartnerName(raw)) return 'Compañero'
  return raw
}

export function formatProfileLocation(city: string | undefined, country: string | undefined): string {
  const c = (city || '').trim()
  const co = (country || 'Chile').trim()
  if (c) return `${c}, ${co}`
  return co
}

export function hasReliableMapCoords(profile: Pick<Profile, 'lat' | 'lng'>): boolean {
  const lat = Number(profile.lat)
  const lng = Number(profile.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  if (Math.abs(lat) < 0.001 && Math.abs(lng) < 0.001) return false
  if (Math.abs(lat + 33) < DEFAULT_COORD_EPS && Math.abs(lng + 71) < DEFAULT_COORD_EPS) return false
  if (Math.abs(lat + 33.02) < DEFAULT_COORD_EPS && Math.abs(lng + 71.55) < DEFAULT_COORD_EPS) return false
  return true
}
