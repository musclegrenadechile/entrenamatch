/**
 * Fase 97 — URL deep links (?chat=, ?sync=, ?session=, ?profile=) + push payload bridge.
 */

import type { NotificationNavTarget } from './notificationNavigation'
import { resolvePushNotificationData, type PushData } from './pushNavigation'

export function parseAppDeepLink(search = window.location.search): NotificationNavTarget | null {
  try {
    const params = new URLSearchParams(search)

    const pushType = params.get('push')
    if (pushType) {
      const data: PushData = { type: pushType }
      params.forEach((v, k) => {
        if (k !== 'push') data[k] = v
      })
      return resolvePushNotificationData(data)
    }

    const chat = params.get('chat')?.trim()
    if (chat) {
      return {
        tab: 'red',
        activeChat: chat,
        partnerName: params.get('name') || undefined,
      }
    }

    const sync = params.get('sync')?.trim()
    if (sync) {
      return {
        tab: 'explore',
        showSyncArena: true,
        startSyncWith: { partnerId: sync, partnerName: params.get('name') || undefined },
      }
    }

    const session = params.get('session')?.trim()
    if (session) {
      if (session.startsWith('sq')) {
        return { tab: 'squads', selectedSquad: session }
      }
      return { tab: 'sesiones', groupChatId: session }
    }

    const profile = params.get('profile')?.trim()
    if (profile) {
      return { tab: 'explore', openProfileId: profile }
    }

    const map = params.get('map')
    if (map === '1' || map === 'true') {
      return { tab: 'map', showLiveMap: true }
    }

    return null
  } catch {
    return null
  }
}

export function clearAppDeepLinkParams(keys: string[]) {
  try {
    const url = new URL(window.location.href)
    let changed = false
    for (const k of keys) {
      if (url.searchParams.has(k)) {
        url.searchParams.delete(k)
        changed = true
      }
    }
    if (!changed) return
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  } catch {
    /* ignore */
  }
}
