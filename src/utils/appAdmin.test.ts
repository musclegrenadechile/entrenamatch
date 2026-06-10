import { describe, expect, it } from 'vitest'
import { COMMUNITY_ADMIN_BADGE_LABEL, isCommunityAdminProfile } from './appAdmin'

describe('appAdmin', () => {
  it('detects community admin profile', () => {
    expect(isCommunityAdminProfile({ id: 'u1', communityAdmin: true })).toBe(true)
    expect(isCommunityAdminProfile({ id: 'u1' }, ['u1'])).toBe(true)
    expect(isCommunityAdminProfile({ id: 'u2' })).toBe(false)
  })

  it('has admin badge label', () => {
    expect(COMMUNITY_ADMIN_BADGE_LABEL).toBe('Admin')
  })
})
