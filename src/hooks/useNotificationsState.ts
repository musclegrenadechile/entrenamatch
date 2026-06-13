import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import type { Notification } from '../types'
import { loadStoredNotifications, saveStoredNotifications } from '../utils/safeLocalStorage'
import {
  isDuplicateNotification,
  loadNotifPrefs,
  persistNotifPrefs,
  shouldAllowNotificationType,
  type NotifPrefs,
} from '../utils/notificationGating'

/**
 * Fase 361 — notifications list, prefs, and addNotification outside App.tsx.
 */
export function useNotificationsState() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(loadNotifPrefs)

  const addNotificationRef = useRef<
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  >(() => {})

  useEffect(() => {
    persistNotifPrefs(notifPrefs)
  }, [notifPrefs])

  useEffect(() => {
    const saved = loadStoredNotifications()
    if (saved.length > 0) setNotifications(saved)
  }, [])

  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    const pruned = saveStoredNotifications(newNotifications)
    setNotifications(pruned)
  }, [])

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const type = notification.type || 'message'
      if (!shouldAllowNotificationType(type, notifPrefs)) return

      if (isDuplicateNotification(notifications, notification.relatedId, type)) return

      const newNotif: Notification = {
        ...notification,
        id: 'notif' + Date.now(),
        timestamp: Date.now(),
        read: false,
      }
      const updated = [newNotif, ...notifications].slice(0, 25)
      saveNotifications(updated)
    },
    [notifPrefs, notifications, saveNotifications]
  )

  useEffect(() => {
    addNotificationRef.current = addNotification
  }, [addNotification])

  const markNotificationRead = useCallback(
    (notifId: string) => {
      const updated = notifications.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      saveNotifications(updated)
    },
    [notifications, saveNotifications]
  )

  const clearReadNotifications = useCallback(() => {
    const hasRead = notifications.some((n) => n.read)
    if (hasRead) saveNotifications(notifications.filter((n) => !n.read))
  }, [notifications, saveNotifications])

  const markAllNotificationsRead = useCallback(() => {
    saveNotifications(notifications.map((n) => ({ ...n, read: true })))
  }, [notifications, saveNotifications])

  return {
    notifications,
    setNotifications,
    showNotifications,
    setShowNotifications,
    notifPrefs,
    setNotifPrefs,
    saveNotifications,
    addNotification,
    addNotificationRef: addNotificationRef as RefObject<
      (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
    >,
    markNotificationRead,
    clearReadNotifications,
    markAllNotificationsRead,
  }
}
