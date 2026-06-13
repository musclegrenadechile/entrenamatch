import type { Notification } from '../types'

export type NotificationPanelMeta = {
  typeIcon: string
  isNetworkNotif: boolean
  isNetworkLive: boolean
  isDailyPulse: boolean
  rowClassName: string
}

export function getNotificationPanelMeta(
  notif: Notification,
  syncBonds: Record<string, unknown>
): NotificationPanelMeta {
  const isNetworkNotif =
    notif.type === 'message' && !!notif.relatedId && !!syncBonds[notif.relatedId]
  const isNetworkLive =
    (notif.type === 'session_join' || notif.type === 'squad_join') &&
    !!notif.relatedId &&
    !!syncBonds[notif.relatedId]
  const isDailyPulse = notif.type === 'daily_pulse'

  const typeIcon =
    notif.type === 'message'
      ? isNetworkNotif
        ? '⭐'
        : '💬'
      : notif.type === 'match' || notif.type === 'like_received'
        ? '❤️'
        : notif.type === 'session_join'
          ? isNetworkLive
            ? '🔥'
            : '👥'
          : notif.type === 'squad_join'
            ? '🏋️'
            : isDailyPulse
              ? '🌅'
              : '🔔'

  const rowClassName = [
    'p-4 border-b border-[#2F2F35] flex items-start gap-3 active:bg-[#1C1C20] cursor-pointer',
    !notif.read ? 'bg-[#1C1C20]' : '',
    isNetworkNotif || isNetworkLive
      ? 'network-notif border-l-4 border-[#FFD700] bg-[#1a160f]'
      : '',
    isDailyPulse ? 'border-l-4 border-[#FF671F] bg-[#1a140f]' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return { typeIcon, isNetworkNotif, isNetworkLive, isDailyPulse, rowClassName }
}
