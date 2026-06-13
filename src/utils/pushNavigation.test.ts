import { describe, expect, it } from 'vitest'
import { resolvePushNotificationData } from './pushNavigation'

describe('resolvePushNotificationData', () => {
  it('returns null without type', () => {
    expect(resolvePushNotificationData({})).toBeNull()
  })

  it('opens trainer coach on booking push', () => {
    expect(resolvePushNotificationData({ type: 'trainer_booking_new' })).toEqual({
      tab: 'profile',
      openTrainerCoach: true,
    })
  })

  it('opens EntrenaCoach Ahora tab on dispatch offer', () => {
    expect(resolvePushNotificationData({ type: 'trainer_dispatch_offer' })).toEqual({
      tab: 'profile',
      openTrainerCoach: true,
      trainerCoachTab: 'now',
    })
  })

  it('opens explore on incoming like push', () => {
    expect(
      resolvePushNotificationData({ type: 'like_received', userId: 'u9', partnerName: 'Cote' })
    ).toEqual({
      tab: 'explore',
      openProfileId: 'u9',
      partnerName: 'Cote',
    })
  })

  it('opens chat on new message', () => {
    expect(
      resolvePushNotificationData({ type: 'message_new', userId: 'u1', partnerName: 'Ana' })
    ).toEqual({
      tab: 'red',
      activeChat: 'u1',
      partnerName: 'Ana',
    })
  })

  it('opens squad on squad group message', () => {
    expect(
      resolvePushNotificationData({ type: 'group_message', groupChatId: 'sq_abc', partnerName: 'Squad' })
    ).toEqual({
      tab: 'squads',
      selectedSquad: 'sq_abc',
      partnerName: 'Squad',
    })
  })

  it('opens marketplace orders on order update push', () => {
    expect(resolvePushNotificationData({ type: 'marketplace_order_update' })).toEqual({
      tab: 'profile',
      openMarketplace: true,
      marketplaceOrdersTab: true,
    })
  })

  it('opens live map + modal on team_live push', () => {
    expect(
      resolvePushNotificationData({ type: 'team_live', userId: 'u2', partnerName: 'Leo' })
    ).toEqual({
      tab: 'explore',
      showLiveMap: true,
      showLiveModal: true,
      showSyncArena: false,
      startSyncWith: { partnerId: 'u2', partnerName: 'Leo' },
    })
  })

  it('opens sync arena on team_sync push', () => {
    expect(
      resolvePushNotificationData({ type: 'team_sync', userId: 'u3', partnerName: 'Mia' })
    ).toEqual({
      tab: 'explore',
      showLiveMap: true,
      showLiveModal: false,
      showSyncArena: true,
      startSyncWith: { partnerId: 'u3', partnerName: 'Mia' },
    })
  })
})
