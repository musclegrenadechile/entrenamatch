/**
 * FCM / native push payload → in-app navigation (Phase 5 deep links).
 */

import type { NotificationNavTarget } from './notificationNavigation'

export type PushData = Record<string, string | undefined>

export function resolvePushNotificationData(data: PushData): NotificationNavTarget | null {
  if (!data?.type) return null

  const type = data.type
  const userId = data.userId
  const partnerName = data.partnerName

  if (type === 'city_challenge_complete') {
    return { tab: 'home' }
  }

  if (type === 'trainer_booking_new' || type === 'trainer_booking_update') {
    return { tab: 'profile', openTrainerCoach: true }
  }

  if (type === 'trainer_dispatch_offer') {
    return { tab: 'profile', openTrainerCoach: true, trainerCoachTab: 'now' as const }
  }

  if (type === 'message_new' && userId) {
    return { tab: 'red', activeChat: userId, partnerName }
  }

  if (type === 'match_new' && userId) {
    return { tab: 'red', activeChat: userId, partnerName }
  }

  if (type === 'like_received' && userId) {
    return { tab: 'explore', openProfileId: userId, partnerName }
  }

  if (type === 'group_message') {
    const groupChatId = data.groupChatId
    if (groupChatId?.startsWith('sq')) {
      return { tab: 'squads', selectedSquad: groupChatId, partnerName }
    }
    if (groupChatId) {
      return { tab: 'sesiones', groupChatId, partnerName }
    }
  }

  if (type === 'marketplace_order_update') {
    return { tab: 'profile', openMarketplace: true, marketplaceOrdersTab: true }
  }

  if (type === 'daily_pulse') {
    return { tab: 'profile', showDailyPulse: true }
  }

  if (type === 'weekly_pact') {
    return { tab: 'home' }
  }

  if (type === 'session_reminder' && data.groupChatId) {
    if (data.groupChatId.startsWith('sq')) {
      return { tab: 'squads', selectedSquad: data.groupChatId }
    }
    return { tab: 'sesiones', groupChatId: data.groupChatId }
  }

  if (type === 'profile_view' && userId) {
    return { tab: 'explore', openProfileId: userId }
  }

  if (type === 'map_live') {
    return { tab: 'map', showLiveMap: true, showLiveModal: true }
  }

  const isLive = type === 'team_live' || type === 'network_live'
  const isSync = type === 'team_sync' || type === 'network_sync'

  if (isLive || isSync) {
    if (userId) {
      return {
        tab: 'explore',
        showLiveMap: true,
        showLiveModal: !isSync,
        showSyncArena: isSync,
        startSyncWith: { partnerId: userId, partnerName },
      }
    }
    return { tab: 'explore', showLiveMap: true, showLiveModal: true }
  }

  return null
}
