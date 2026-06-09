import { describe, expect, it } from 'vitest'
import { resolveLiveMapMerge } from './liveMapSources'

const u = (id: string, lat = -33, lng = -71) => ({
  id,
  trainingNow: true,
  lat,
  lng,
  trainingNowSince: Date.now(),
})

describe('resolveLiveMapMerge (fase 75)', () => {
  it('uses presence only when healthy — no duplicate from profiles query', () => {
    const r = resolveLiveMapMerge({
      presenceHealthy: true,
      presenceUsers: [u('a')],
      profilesQueryUsers: [u('a', -34, -72), u('b')],
    })
    expect(r.mode).toBe('presence')
    expect(r.profilesForMerge).toEqual([])
    expect(r.merged.map((x) => x.id)).toEqual(['a'])
  })

  it('merges profiles query when presence unhealthy', () => {
    const r = resolveLiveMapMerge({
      presenceHealthy: false,
      presenceUsers: [u('a')],
      profilesQueryUsers: [u('b')],
    })
    expect(r.mode).toBe('profiles_fallback')
    expect(r.merged.map((x) => x.id).sort()).toEqual(['a', 'b'])
  })

  it('falls back to stale presence slice when profiles empty', () => {
    const r = resolveLiveMapMerge({
      presenceHealthy: false,
      presenceUsers: [u('a')],
      profilesQueryUsers: [],
    })
    expect(r.mode).toBe('presence_error_fallback')
    expect(r.merged).toHaveLength(1)
  })
})
