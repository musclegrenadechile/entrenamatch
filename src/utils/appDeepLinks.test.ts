import { describe, expect, it } from 'vitest'
import { parseAppDeepLink } from './appDeepLinks'

describe('appDeepLinks (fase 97)', () => {
  it('opens chat from ?chat=', () => {
    expect(parseAppDeepLink('?chat=u1&name=Ana')).toEqual({
      tab: 'red',
      activeChat: 'u1',
      partnerName: 'Ana',
    })
  })

  it('opens sync arena from ?sync=', () => {
    expect(parseAppDeepLink('?sync=p2')).toMatchObject({
      tab: 'explore',
      showSyncArena: true,
      startSyncWith: { partnerId: 'p2' },
    })
  })

  it('bridges ?push= to push resolver', () => {
    expect(parseAppDeepLink('?push=message_new&userId=u9')).toEqual({
      tab: 'red',
      activeChat: 'u9',
    })
  })

  it('opens profile from ?profile=', () => {
    expect(parseAppDeepLink('?profile=u5')).toEqual({
      tab: 'explore',
      openProfileId: 'u5',
    })
  })
})
