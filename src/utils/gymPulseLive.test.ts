import { describe, expect, it } from 'vitest'
import {
  filterMapLiveUsers,
  hasMapCoords,
  isActiveLiveUser,
  mergeLiveUsersById,
  ASSUMED_LIVE_SESSION_MS,
} from './gymPulseLive'

const km = (a: number, b: number, c: number, d: number) => {
  const R = 6371
  const dLat = ((c - a) * Math.PI) / 180
  const dLng = ((d - b) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a * Math.PI) / 180) * Math.cos((c * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

describe('gymPulseLive (fase 78)', () => {
  it('mergeLiveUsersById dedupes by id and keeps trainingNow', () => {
    const merged = mergeLiveUsersById([
      [{ id: 'x', trainingNow: true, lat: 1, lng: 1 }],
      [{ id: 'x', trainingNow: false, name: 'Updated' }],
    ])
    expect(merged).toHaveLength(1)
    expect(merged[0].name).toBe('Updated')
    expect(merged[0].trainingNow).toBe(true)
  })

  it('mergeLiveUsersById accepts flat user[] (legacy wrong call — no iterable crash)', () => {
    const merged = mergeLiveUsersById([
      { id: 'a', trainingNow: true, lat: 1, lng: 1 },
      { id: 'b', trainingNow: true, lat: 2, lng: 2 },
    ] as any)
    expect(merged).toHaveLength(2)
    expect(merged.map((u) => u.id).sort()).toEqual(['a', 'b'])
  })

  it('isActiveLiveUser respects session TTL', () => {
    const now = Date.now()
    expect(isActiveLiveUser({ trainingNow: true, trainingNowSince: now - 1000 }, now)).toBe(true)
    expect(
      isActiveLiveUser(
        { trainingNow: true, trainingNowSince: now - ASSUMED_LIVE_SESSION_MS - 1 },
        now
      )
    ).toBe(false)
  })

  it('hasMapCoords rejects invalid coords', () => {
    expect(hasMapCoords({ lat: -33, lng: -71 })).toBe(true)
    expect(hasMapCoords({ lat: NaN, lng: -71 })).toBe(false)
  })

  it('filterMapLiveUsers applies near-only and network filters', () => {
    const users = [
      {
        id: 'near',
        trainingNow: true,
        lat: -33.02,
        lng: -71.55,
        trainingNowSince: Date.now(),
        isNetworkBond: true,
      },
      {
        id: 'far',
        trainingNow: true,
        lat: -40,
        lng: -72,
        trainingNowSince: Date.now(),
        isNetworkBond: false,
      },
    ]
    const loc = { lat: -33.02, lng: -71.55 }
    const nearOnly = filterMapLiveUsers(users, {
      mapNearOnly: true,
      userLocation: loc,
      getDistanceKm: km,
    })
    expect(nearOnly.map((u) => u.id)).toEqual(['near'])

    const networkOnly = filterMapLiveUsers(users, {
      showOnlyNetwork: true,
      userLocation: loc,
      getDistanceKm: km,
    })
    expect(networkOnly.map((u) => u.id)).toEqual(['near'])
  })
})
