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
    return { tab: 'messages', activeChat: userId, partnerName }
  }

  if (type === 'match_new' && userId) {
    return { tab: 'messages', activeChat: userId, partnerName }
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
