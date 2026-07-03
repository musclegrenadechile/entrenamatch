/**
 * Fase 383 — discovery queries with normalized city matching (multi-country launch).
 */

import type { Firestore, QuerySnapshot, Unsubscribe } from 'firebase/firestore'
import type { Profile } from '../types'
import {
  REGISTRATION_CITY_OPTIONS,
  pilotCityLabel,
} from '../constants/pilotProgram'
import { normalizeCity } from './localNetwork'
import { parseProfileFromFirestoreDoc } from '../utils/profileFirestoreParse'

export type DiscoveryZone = {
  city?: string | null
  country?: string | null
}

export function resolveDiscoveryCityNorm(city?: string | null): string {
  const norm = normalizeCity(city)
  if (!norm) return ''
  const exact = REGISTRATION_CITY_OPTIONS.find((c) => c.norm === norm)
  if (exact) return exact.norm
  const fuzzy = REGISTRATION_CITY_OPTIONS.find(
    (c) => norm.startsWith(c.norm) || c.norm.startsWith(norm)
  )
  return fuzzy?.norm ?? norm
}

/** Legacy Firestore city strings that must still match discovery queries. */
const DISCOVERY_CITY_ALIASES: Record<string, string[]> = {
  concon: ['Concón', 'Concon'],
  'vina del mar': ['Vina del Mar'],
  valparaiso: ['Valparaiso'],
}

/** Firestore `city` values to query (canonical label + raw input + legacy aliases). */
export function buildDiscoveryCityQueryTerms(city?: string | null): string[] {
  const trimmed = (city || '').trim()
  if (!trimmed) return []
  const terms = new Set<string>()
  terms.add(trimmed)
  const canonical = pilotCityLabel(trimmed)
  if (canonical) terms.add(canonical)
  const norm = resolveDiscoveryCityNorm(trimmed)
  for (const alias of DISCOVERY_CITY_ALIASES[norm] || []) {
    terms.add(alias)
  }
  return [...terms]
}

export function profileMatchesDiscoveryZone(
  profile: Pick<Profile, 'city' | 'country'>,
  zone: DiscoveryZone
): boolean {
  const country = (zone.country || '').trim()
  if (country) {
    return (profile.country || '').trim() === country
  }
  const targetNorm = resolveDiscoveryCityNorm(zone.city)
  if (targetNorm) {
    return resolveDiscoveryCityNorm(profile.city) === targetNorm
  }
  return true
}

export function primaryDiscoveryCityForListener(city?: string | null): string {
  const terms = buildDiscoveryCityQueryTerms(city)
  return terms[terms.length - 1] || (city || '').trim()
}

export type FetchDiscoveryProfilesOpts = {
  city?: string | null
  country?: string | null
  limit: number
  excludeUid?: string | null
  blockedIds?: readonly string[]
  hideBetaBot?: (id: string) => boolean
}

function collectProfilesFromSnapshot(
  snapshot: QuerySnapshot,
  opts: FetchDiscoveryProfilesOpts,
  zone: DiscoveryZone,
  applyZoneFilter: boolean
): Profile[] {
  const profiles: Profile[] = []
  const blocked = new Set(opts.blockedIds || [])
  const hideBot = opts.hideBetaBot ?? (() => false)

  snapshot.forEach((doc) => {
    if (doc.id === opts.excludeUid) return
    if (blocked.has(doc.id)) return
    if (hideBot(doc.id)) return
    const parsed = parseProfileFromFirestoreDoc(doc.id, doc.data() as Record<string, unknown>)
    if (!parsed) return
    if (applyZoneFilter && !profileMatchesDiscoveryZone(parsed, zone)) return
    profiles.push(parsed)
  })
  return profiles
}

/** Load explore deck profiles — tries canonical city terms, then country, then global. */
export async function fetchDiscoveryProfiles(
  db: Firestore,
  opts: FetchDiscoveryProfilesOpts
): Promise<Profile[]> {
  const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore')
  const profilesRef = collection(db, 'profiles')
  const zone: DiscoveryZone = { city: opts.city, country: opts.country }
  const byId = new Map<string, Profile>()
  const terms = buildDiscoveryCityQueryTerms(opts.city)

  const merge = (list: Profile[]) => {
    for (const p of list) {
      if (!byId.has(p.id)) byId.set(p.id, p)
    }
  }

  for (const term of terms) {
    try {
      const q = query(
        profilesRef,
        where('city', '==', term),
        orderBy('updatedAt', 'desc'),
        limit(opts.limit)
      )
      const snap = await getDocs(q)
      merge(collectProfilesFromSnapshot(snap, opts, zone, false))
    } catch {
      /* per-term index/query errors — continue */
    }
  }

  const country = (opts.country || '').trim()
  if (country) {
    try {
      const q = query(
        profilesRef,
        where('country', '==', country),
        orderBy('updatedAt', 'desc'),
        limit(opts.limit)
      )
      const snap = await getDocs(q)
      merge(collectProfilesFromSnapshot(snap, opts, zone, true))
    } catch {
      /* country+updatedAt index may be missing */
    }
  }

  if (byId.size === 0) {
    const q = query(profilesRef, orderBy('updatedAt', 'desc'), limit(opts.limit))
    const snap = await getDocs(q)
    merge(collectProfilesFromSnapshot(snap, opts, zone, terms.length > 0 || !!country))
  }

  return [...byId.values()]
}

export type DiscoveryProfilesListenerOpts = FetchDiscoveryProfilesOpts & {
  onProfiles: (profiles: Profile[]) => void
  onError?: (err: unknown) => void
}

/**
 * Realtime discovery — one listener per city query term (Firestore city match is exact).
 * Merges all snapshots so users with legacy city strings still appear in Explorar.
 */
export function attachDiscoveryProfilesListener(
  db: Firestore,
  opts: DiscoveryProfilesListenerOpts
): () => void {
  const unsubs: Unsubscribe[] = []
  /** One bucket per Firestore query — replaced wholesale on each snapshot. */
  const buckets = new Map<string, Map<string, Profile>>()
  const zone: DiscoveryZone = { city: opts.city, country: opts.country }
  const terms = buildDiscoveryCityQueryTerms(opts.city)

  const emitMerged = () => {
    const merged = new Map<string, Profile>()
    for (const bucket of buckets.values()) {
      for (const [id, p] of bucket) merged.set(id, p)
    }
    opts.onProfiles([...merged.values()])
  }

  const ingest = (listenerKey: string, snap: QuerySnapshot, applyZoneFilter: boolean) => {
    const incoming = collectProfilesFromSnapshot(snap, opts, zone, applyZoneFilter)
    buckets.set(listenerKey, new Map(incoming.map((p) => [p.id, p])))
    emitMerged()
  }

  void (async () => {
    const { collection, onSnapshot, query, where, orderBy, limit } = await import(
      'firebase/firestore'
    )
    const profilesRef = collection(db, 'profiles')

    const attach = (listenerKey: string, q: ReturnType<typeof query>, applyZoneFilter: boolean) => {
      const unsub = onSnapshot(
        q,
        (snap) => ingest(listenerKey, snap, applyZoneFilter),
        (err) => {
          console.warn('[DiscoveryProfiles] listener error', listenerKey, err)
          buckets.delete(listenerKey)
          emitMerged()
          opts.onError?.(err)
        }
      )
      unsubs.push(unsub)
    }

    if (terms.length === 0) {
      attach(
        'global',
        query(profilesRef, orderBy('updatedAt', 'desc'), limit(opts.limit)),
        terms.length > 0 || !!(opts.country || '').trim()
      )
      return
    }

    for (const term of terms) {
      attach(
        `city:${term}`,
        query(
          profilesRef,
          where('city', '==', term),
          orderBy('updatedAt', 'desc'),
          limit(opts.limit)
        ),
        false
      )
    }

    const country = (opts.country || '').trim()
    if (country) {
      attach(
        `country:${country}`,
        query(
          profilesRef,
          where('country', '==', country),
          orderBy('updatedAt', 'desc'),
          limit(opts.limit)
        ),
        true
      )
    }
  })()

  return () => {
    for (const u of unsubs) u()
    unsubs.length = 0
    buckets.clear()
  }
}
