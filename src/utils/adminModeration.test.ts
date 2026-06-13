import { describe, expect, it } from 'vitest'
import {
  adminActionLabel,
  canAdminBanProfile,
  filterProfilesForAdminSearch,
  formatLiveDuration,
  sortLiveUsersForAdmin,
} from './adminModeration'

describe('adminModeration', () => {
  it('formats live duration', () => {
    const now = 100_000_000
    expect(formatLiveDuration(undefined, now)).toBe('recién')
    expect(formatLiveDuration(now - 5 * 60_000, now)).toBe('5 min')
    expect(formatLiveDuration(now - 90 * 60_000, now)).toBe('1h 30m')
  })

  it('sorts live users oldest first', () => {
    const sorted = sortLiveUsersForAdmin(
      [
        { id: 'b', trainingNow: true, trainingNowSince: 200 },
        { id: 'a', trainingNow: true, trainingNowSince: 100 },
      ],
      10_000
    )
    expect(sorted.map((u) => u.id)).toEqual(['a', 'b'])
  })

  it('searches profiles by name or uid', () => {
    const hits = filterProfilesForAdminSearch(
      [
        { id: 'uid-1', name: 'María', city: 'Viña' } as any,
        { id: 'uid-2', name: 'Pedro', city: 'Santiago' } as any,
      ],
      'viña'
    )
    expect(hits).toHaveLength(1)
    expect(hits[0].id).toBe('uid-1')
  })

  it('blocks ban on beta bots', () => {
    expect(canAdminBanProfile({ id: 'beta_bot_x', name: 'Bot' })).toBe(false)
    expect(canAdminBanProfile({ id: 'real-user', name: 'Ana' })).toBe(true)
  })

  it('labels audit actions in Spanish', () => {
    expect(adminActionLabel('suspend_user')).toBe('Suspendió cuenta')
    expect(adminActionLabel('end_live')).toBe('Apagó LIVE')
  })
})
