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

  it('opens chat on new message', () => {
    expect(
      resolvePushNotificationData({ type: 'message_new', userId: 'u1', partnerName: 'Ana' })
    ).toEqual({
      tab: 'messages',
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

  it('opens sesiones on session group message', () => {
    expect(
      resolvePushNotificationData({ type: 'group_message', groupChatId: 'sess_1' })
    ).toEqual({
      tab: 'sesiones',
      groupChatId: 'sess_1',
      partnerName: undefined,
    })
  })
})
