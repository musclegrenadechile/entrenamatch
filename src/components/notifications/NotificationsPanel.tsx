import { AnimatePresence, motion } from 'framer-motion'
import type { Notification } from '../../types'
import { getRelativeTime } from '../../utils/relativeTime'
import { getNotificationPanelMeta } from '../../utils/notificationPanelMeta'

export type NotificationsPanelProps = {
  open: boolean
  notifications: Notification[]
  unreadNotifications: number
  totalChatUnreads: number
  totalSessionUnreads: number
  syncBonds: Record<string, unknown>
  onClose: () => void
  onClearRead: () => void
  onMarkAllRead: () => void
  onNotificationClick: (notif: Notification) => void
}

/** Fase 356 — in-app notifications drawer extracted from App.tsx. */
export function NotificationsPanel({
  open,
  notifications,
  unreadNotifications,
  totalChatUnreads,
  totalSessionUnreads,
  syncBonds,
  onClose,
  onClearRead,
  onMarkAllRead,
  onNotificationClick,
}: NotificationsPanelProps) {
  const totalNew = unreadNotifications + totalChatUnreads + totalSessionUnreads

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[150] flex flex-col" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-[#0D0D10] max-w-[420px] mx-auto w-full mt-[42px] rounded-t-3xl border border-[#2F2F35] overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-[#2F2F35] flex justify-between items-center bg-[#1C1C20]">
              <div className="section-header text-base flex items-center gap-2">
                Notificaciones
                {totalNew > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF671F] text-black font-bold animate-pulse">
                    {totalNew} nuevas
                  </span>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClearRead}
                    className="text-xs text-[#9CA3AF] active:text-white"
                  >
                    Limpiar leídas
                  </button>
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-xs text-[#FF671F] font-medium"
                  >
                    Marcar todo leído
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[#9CA3AF]">No tienes notificaciones aún.</div>
              ) : (
                notifications.map((notif) => {
                  const { typeIcon, isNetworkNotif, rowClassName } = getNotificationPanelMeta(
                    notif,
                    syncBonds
                  )
                  const time = notif.timestamp ? getRelativeTime(notif.timestamp) : ''
                  return (
                    <div
                      key={notif.id}
                      className={rowClassName}
                      onClick={() => onNotificationClick(notif)}
                    >
                      <div className="text-xl mt-0.5 flex-shrink-0">{typeIcon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <div className="font-medium text-sm truncate pr-2">{notif.title}</div>
                          <div className="text-[10px] text-[#9CA3AF] flex-shrink-0">{time}</div>
                        </div>
                        <div className="text-sm text-[#cbd5e1] mt-0.5 line-clamp-2">{notif.body}</div>
                        {!notif.read && (
                          <div className="mt-1.5 inline-block w-1.5 h-1.5 bg-[#FF671F] rounded-full" />
                        )}
                        {isNetworkNotif && (
                          <div className="mt-1 text-[9px] text-[#FFD700] font-bold">
                            ⭐ De tu Red (Fuerza del equipo)
                          </div>
                        )}
                      </div>
                      {notif.photoUrl && (
                        <img
                          src={notif.photoUrl}
                          alt={notif.title || 'Notificación'}
                          className="w-9 h-9 rounded-xl object-cover flex-shrink-0 border border-[#2F2F35]"
                        />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
