import { AnimatePresence, motion } from 'framer-motion'
import type { Notification } from '../../types'
import { getRelativeTime } from '../../utils/relativeTime'
import { getNotificationPanelMeta } from '../../utils/notificationPanelMeta'
import { EmV2EmptyState } from '../ui/EmV2EmptyState'

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

/** Fase 356 — in-app notifications drawer (oleada 353 v2). */
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
            className="em-v2-notifications flex-1 max-w-[420px] mx-auto w-full mt-[42px] rounded-t-3xl overflow-hidden flex flex-col"
          >
            <div className="em-v2-notifications__header p-4 flex justify-between items-center">
              <div className="em-v2-notifications__title-row">
                <h2 className="em-v2-notifications__title">Notificaciones</h2>
                {totalNew > 0 && (
                  <span className="em-v2-notifications__badge">
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
                <EmV2EmptyState
                  className="m-4 em-v2-fade-in"
                  emoji="🔔"
                  title="Sin notificaciones"
                  body="Cuando haya matches, mensajes o actividad en tu red, aparecerán aquí."
                  compact
                />
              ) : (
                notifications.map((notif) => {
                  const { typeIcon, isNetworkNotif, rowClassName } = getNotificationPanelMeta(
                    notif,
                    syncBonds
                  )
                  return (
                    <button
                      key={notif.id}
                      type="button"
                      onClick={() => onNotificationClick(notif)}
                      className={`em-v2-notifications__row w-full text-left ${rowClassName}`}
                    >
                      <span className="text-lg shrink-0" aria-hidden>
                        {typeIcon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{notif.title}</div>
                        <div className="text-xs text-[#9CA3AF] truncate">{notif.body}</div>
                        {isNetworkNotif && (
                          <div className="text-[10px] text-[#FF671F] mt-0.5">Tu red</div>
                        )}
                      </div>
                      <span className="text-[10px] text-[#9CA3AF] shrink-0">
                        {getRelativeTime(notif.timestamp)}
                      </span>
                    </button>
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