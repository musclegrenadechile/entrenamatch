import { describe, expect, it } from 'vitest'
import {
  DEFAULT_NOTIF_PREFS,
  isDuplicateNotification,
  loadNotifPrefs,
  shouldAllowNotificationType,
} from './notificationGating'
import type { Notification } from '../types'

describe('notificationGating', () => {
  it('blocks messages when messages pref off', () => {
    expect(shouldAllowNotificationType('message', { ...DEFAULT_NOTIF_PREFS, messages: false })).toBe(
      false
    )
    expect(shouldAllowNotificationType('match', { ...DEFAULT_NOTIF_PREFS, messages: false })).toBe(
      false
    )
  })

  it('blocks live joins when live pref off', () => {
    expect(shouldAllowNotificationType('session_join', { ...DEFAULT_NOTIF_PREFS, live: false })).toBe(
      false
    )
  })

  it('detects duplicate within 5 minutes', () => {
    const list: Notification[] = [
      {
        id: 'n1',
        type: 'message',
        relatedId: 'u1',
        title: 't',
        body: 'b',
        timestamp: Date.now() - 60_000,
        read: false,
      },
    ]
    expect(isDuplicateNotification(list, 'u1', 'message')).toBe(true)
    expect(isDuplicateNotification(list, 'u2', 'message')).toBe(false)
  })

  it('loadNotifPrefs defaults to all enabled', () => {
    const prefs = loadNotifPrefs()
    expect(prefs.messages).toBe(true)
    expect(prefs.live).toBe(true)
  })
})
