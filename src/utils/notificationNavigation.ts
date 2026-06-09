/**
 * Deep-link routing from in-app / browser notifications.
 */

import type { Notification } from '../types'

export interface NotificationNavTarget {
  tab: 'home' | 'red' | 'messages' | 'sesiones' | 'squads' | 'profile' | 'explore' | 'map'
  activeChat?: string
  groupChatId?: string
  selectedSquad?: string
  showDailyPulse?: boolean
  showSyncArena?: boolean
  showLiveMap?: boolean
  showLiveModal?: boolean
  openTrainerCoach?: boolean
  trainerCoachTab?: 'explore' | 'now' | 'sessions' | 'trainer'
  openMarketplace?: boolean
  marketplaceOrdersTab?: boolean
  openProfileId?: string
  startSyncWith?: { partnerId: string; partnerName?: string }
}

export function isSquadRelatedId(id: string): boolean {
  return id.startsWith('sq')
}

/** Training session group chat id (s* but not sq*). */
export function isSessionGroupChatId(id: string, knownSessionIds?: Set<string>): boolean {
  if (knownSessionIds?.has(id)) return true
  return id.startsWith('s') && !id.startsWith('sq')
}

export function resolveNotificationTarget(
  notif: Pick<Notification, 'type' | 'relatedId'>,
  ctx?: { sessionIds?: Set<string> }
): NotificationNavTarget | null {
  const id = notif.relatedId
  if (!id && notif.type !== 'daily_pulse') return null

  if (notif.type === 'daily_pulse') {
    return { tab: 'profile', showDailyPulse: true }
  }

  if (notif.type === 'match' && id) {
    return { tab: 'red', activeChat: id }
  }

  if (notif.type === 'like_received' && id) {
    return { tab: 'explore', openProfileId: id }
  }

  if (notif.type === 'squad_join' && id) {
    return { tab: 'squads', selectedSquad: id }
  }

  if (notif.type === 'message' && id) {
    if (isSquadRelatedId(id)) {
      return { tab: 'squads', selectedSquad: id }
    }
    if (isSessionGroupChatId(id, ctx?.sessionIds)) {
      return { tab: 'sesiones', groupChatId: id }
    }
    return { tab: 'red', activeChat: id }
  }

  if (notif.type === 'group_message' && id) {
    if (isSquadRelatedId(id)) {
      return { tab: 'squads', selectedSquad: id }
    }
    return { tab: 'sesiones', groupChatId: id }
  }

  if (notif.type === 'session_join' && id) {
    if (isSessionGroupChatId(id, ctx?.sessionIds)) {
      return { tab: 'sesiones', groupChatId: id }
    }
    return { tab: 'explore', startSyncWith: { partnerId: id } }
  }

  if (notif.type === 'sync_invite' && id) {
    return { tab: 'explore', showSyncArena: true, startSyncWith: { partnerId: id } }
  }

  return null
}
